import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();
router.use(authenticate, requireRole('buyer', 'admin'));

const uploadSchema = z.object({
  bookingId: z.string().min(1),
  fileName: z.string().min(1).max(200),
  contentType: z.enum(['image/png', 'image/jpeg', 'image/webp', 'application/pdf', 'video/mp4']),
  sizeBytes: z.number().int().positive().max(25 * 1024 * 1024),
  storageUrl: z.string().url(),
});

router.get('/', async (req, res) => {
  const assets = await prisma.creativeAsset.findMany({
    where: req.user!.role === 'admin' ? {} : { buyerId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json(assets);
});

router.post('/', validate(uploadSchema), async (req, res) => {
  const booking = await prisma.booking.findFirst({
    where: { id: req.body.bookingId, buyerId: req.user!.userId },
  });
  if (!booking) {
    res.status(404).json({ error: 'Booking not found' });
    return;
  }
  const asset = await prisma.creativeAsset.create({
    data: { ...req.body, buyerId: req.user!.userId },
  });
  res.status(201).json(asset);
});

router.patch('/:id/review', validate(z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  note: z.string().max(500).optional(),
})), async (req, res) => {
  const asset = await prisma.creativeAsset.findFirst({
    where: {
      id: req.params.id,
      ...(req.user!.role === 'admin' ? {} : { buyerId: req.user!.userId }),
    },
    include: { booking: true },
  });
  if (!asset) {
    res.status(404).json({ error: 'Creative asset not found' });
    return;
  }
  const settings = await prisma.buyerSetting.findUnique({ where: { userId: asset.buyerId } });
  const nextStatus = settings?.approvalWorkflow === 'MANAGER' ? 'AwaitingManager' : 'PendingApproved';
  const [updated] = await prisma.$transaction([
    prisma.creativeAsset.update({
      where: { id: asset.id },
      data: { status: req.body.decision, reviewNote: req.body.note, reviewedAt: new Date() },
    }),
    ...(req.body.decision === 'APPROVED'
      ? [prisma.booking.update({ where: { id: asset.bookingId }, data: { status: nextStatus } })]
      : []),
  ]);
  res.json(updated);
});

export default router;
