import { Router, Request, Response } from 'express';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../db';
import { isValidInterval, toBookingInterval } from '../lib/bookingSchedule';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createBookingSchema = z.object({
  billboardId: z.string().min(1),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startAt: z.string().datetime({ offset: true }).optional(),
  endAt: z.string().datetime({ offset: true }).optional(),
  campaignName: z.string().min(1),
  clientName: z.string().min(1),
  totalCost: z.number().positive(),
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
  status: z.enum(['PendingApproved', 'Live', 'Completed']),
});

// Advertiser/Admin: list bookings (advertisers see their own, admin sees all)
router.get('/', authenticate, async (req: Request, res: Response) => {
  const where = req.user!.role === 'admin'
    ? {}
    : { clientName: req.user!.email };

  const bookings = await prisma.booking.findMany({
    where,
    include: { billboard: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(bookings);
});

// Advertiser: create booking
router.post('/', authenticate, requireRole('advertiser', 'admin'), validate(createBookingSchema), async (req: Request, res: Response) => {
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
          status: { in: ['PendingApproved', 'Live'] },
          startAt: { lt: endAt },
          endAt: { gt: startAt },
        },
        select: { id: true },
      });
      if (conflict) {
        throw new BookingRequestError(409, 'The selected time slot is no longer available');
      }

      return transaction.booking.create({
        data: {
          ...req.body,
          startAt,
          endAt,
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    res.status(201).json(booking);
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

// Vendor/Admin: update booking status
router.patch('/:id/status', authenticate, requireRole('vendor', 'admin'), validate(updateStatusSchema), async (req: Request, res: Response) => {
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
  if (status === 'Completed') {
    await prisma.billboard.update({
      where: { id: booking.billboardId },
      data: { status: 'Available' },
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
