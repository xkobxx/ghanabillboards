import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
router.use(authenticate, requireRole('buyer', 'admin'));

router.get('/', async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'AwaitingManager',
      ...(req.user!.role === 'admin' ? {} : { buyerId: req.user!.userId }),
    },
    include: { billboard: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(bookings);
});

router.post('/:bookingId/decision', validate(z.object({
  decision: z.enum(['APPROVE', 'REJECT']),
  reason: z.string().max(500).optional(),
})), async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: {
      id: req.params.bookingId,
      status: 'AwaitingManager',
      ...(req.user!.role === 'admin' ? {} : { buyerId: req.user!.userId }),
    },
  });
  if (!booking) {
    res.status(404).json({ error: 'Pending approval not found' });
    return;
  }
  const status = req.body.decision === 'APPROVE' ? 'PendingApproved' : 'Rejected';
  const updated = await prisma.booking.update({ where: { id: booking.id }, data: { status } });
  if (booking.buyerId) {
    await prisma.notification.create({
      data: {
        userId: booking.buyerId,
        type: `approval.${req.body.decision.toLowerCase()}`,
        title: req.body.decision === 'APPROVE' ? 'Manager approved booking' : 'Manager rejected booking',
        body: req.body.reason || booking.campaignName,
      },
    });
  }
  res.json(updated);
});

export default router;
