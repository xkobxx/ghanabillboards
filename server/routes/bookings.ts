import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { isValidInterval, toBookingInterval } from '../lib/bookingSchedule';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { convertUsdToMinor } from '../services/money';

const router = Router();

const createBookingSchema = z.object({
  billboardId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startAt: z.string().datetime({ offset: true }).optional(),
  endAt: z.string().datetime({ offset: true }).optional(),
  campaignName: z.string().min(1),
  clientName: z.string().min(1),
  totalCost: z.number().positive().optional(),
  slogan: z.string().optional(),
}).superRefine((booking, context) => {
  if (Boolean(booking.startAt) !== Boolean(booking.endAt)) {
    context.addIssue({
      code: 'custom',
      path: [booking.startAt ? 'endAt' : 'startAt'],
      message: 'startAt and endAt must be provided together',
    });
    return;
  }

  if (!isValidInterval(toBookingInterval(booking))) {
    context.addIssue({
      code: 'custom',
      path: [booking.endAt ? 'endAt' : 'endDate'],
      message: 'Booking end must be after booking start',
    });
  }
});

const updateStatusSchema = z.object({
  status: z.enum(['PendingApproved', 'Live', 'Completed', 'Rejected']),
});

// Buyer/Admin: list bookings (buyers see their own, admin sees all)
router.get('/', authenticate, async (req: Request, res: Response) => {
  const where = req.user!.role === 'admin'
    ? {}
    : { buyerId: req.user!.userId };

  const bookings = await prisma.booking.findMany({
    where,
    include: { billboard: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(bookings);
});

// Buyer: create booking
router.post('/', authenticate, requireRole('buyer', 'admin'), validate(createBookingSchema), async (req: Request, res: Response) => {
  const { startAt, endAt } = toBookingInterval(req.body);

  try {
    const booking = await prisma.$transaction(async (transaction) => {
      const billboard = await transaction.billboard.findUnique({
        where: { id: req.body.billboardId },
      });
      if (!billboard) {
        throw new BookingRequestError(404, 'Billboard not found');
      }
      if (billboard.status === 'Maintenance') {
        throw new BookingRequestError(409, 'Billboard is under maintenance');
      }

      const conflict = await transaction.booking.findFirst({
        where: {
          billboardId: req.body.billboardId,
          status: { in: ['AwaitingCreative', 'AwaitingManager', 'PendingApproved', 'Live'] },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
        select: { id: true },
      });
      if (conflict) {
        throw new BookingRequestError(409, 'The selected time slot is no longer available');
      }

      const settings = await transaction.buyerSetting.upsert({
        where: { userId: req.user!.userId },
        update: {},
        create: { userId: req.user!.userId },
      });
      const durationMs = endAt.getTime() - startAt.getTime();
      const billableDays = Math.max(1, Math.ceil(durationMs / 86_400_000));
      const totalCost = billableDays * billboard.dailyRate;
      const displayTotalMinor = convertUsdToMinor(totalCost, settings.billingCurrency);
      if (settings.budgetCapMinor !== null && BigInt(displayTotalMinor) > settings.budgetCapMinor) {
        throw new BookingRequestError(422, 'Booking exceeds the account budget cap');
      }
      const status = settings.creativeReviewRequired
        ? 'AwaitingCreative'
        : settings.approvalWorkflow === 'MANAGER'
          ? 'AwaitingManager'
          : 'PendingApproved';

      const invoiceCode = `INV-${crypto.randomUUID().slice(0, 12).toUpperCase()}`;
      const booking = await transaction.booking.create({
        data: {
          ...req.body,
          totalCost,
          startAt,
          endAt,
          buyerId: req.user!.userId,
          billingCurrency: settings.billingCurrency,
          displayTotalMinor,
          invoiceCode,
          status,
        },
      });
      await transaction.invoice.create({
        data: {
          bookingId: booking.id,
          code: invoiceCode,
          currency: settings.billingCurrency,
          totalMinor: BigInt(displayTotalMinor),
          dueAt: new Date(Date.now() + 30 * 86_400_000),
        },
      });
      if (settings.bookingStatusAlerts) {
        await transaction.notification.create({
          data: {
            userId: req.user!.userId,
            type: 'booking.submitted',
            title: 'Booking submitted',
            body: `${booking.campaignName} entered ${status}`,
          },
        });
      }
      if (settings.invoiceAlerts) {
        await transaction.notification.create({
          data: {
            userId: req.user!.userId,
            type: 'invoice.issued',
            title: 'Invoice issued',
            body: `${invoiceCode} · ${booking.campaignName}`,
          },
        });
      }
      return booking;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    res.status(201).json({
      ...booking,
      displayTotalMinor: booking.displayTotalMinor === null ? null : Number(booking.displayTotalMinor),
    });
  } catch (error) {
    if (error instanceof BookingRequestError) {
      res.status(error.status).json({ error: error.message });
      return;
    }
    // A concurrent serializable transaction claimed the same slot first.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      res.status(409).json({ error: 'The selected time slot is no longer available' });
      return;
    }
    throw error;
  }
});

// Publisher/Admin: update booking status
router.patch('/:id/status', authenticate, requireRole('publisher', 'admin'), validate(updateStatusSchema), async (req: Request, res: Response) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }

  const { status } = req.body;
  const updated = await prisma.booking.update({
    where: { id: req.params.id },
    data: { status },
  });

  // When a booking goes Live, mark the billboard as FullyBooked
  if (status === 'Live') {
    await prisma.billboard.update({
      where: { id: booking.billboardId },
      data: { status: 'FullyBooked' },
    });
  }
  // When a booking completes, free the billboard
  if (status === 'Completed' || status === 'Rejected') {
    await prisma.billboard.update({
      where: { id: booking.billboardId },
      data: { status: 'Available' },
    });
  }

  if (booking.buyerId) {
    const settings = await prisma.buyerSetting.findUnique({ where: { userId: booking.buyerId } });
    if (settings?.bookingStatusAlerts !== false) {
      await prisma.notification.create({
        data: {
          userId: booking.buyerId,
          type: `booking.${String(status).toLowerCase()}`,
          title: `Booking ${String(status).toLowerCase()}`,
          body: booking.campaignName,
        },
      });
    }
  }

  if (status === 'Completed' || status === 'Rejected') {
    const watches = await prisma.availabilityWatch.findMany({
      where: { billboardId: booking.billboardId, active: true },
      include: { user: { include: { buyerSetting: true } } },
    });
    for (const watch of watches) {
      if (watch.user.buyerSetting?.availabilityAlerts !== false) {
        await prisma.notification.create({
          data: {
            userId: watch.userId,
            type: 'availability.open',
            title: 'Watched inventory is available',
            body: `${booking.billboardId} is ready to book again`,
          },
        });
      }
    }
    await prisma.availabilityWatch.updateMany({
      where: { billboardId: booking.billboardId, active: true },
      data: { active: false },
    });
  }

  res.json(updated);
});

export default router;

class BookingRequestError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}
