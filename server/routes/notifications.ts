import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', async (req, res) => {
  const notifications = await prisma.notification.findMany({
    where: { userId: req.user!.userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  res.json(notifications);
});

router.patch('/read-all', async (req, res) => {
  await prisma.notification.updateMany({
    where: { userId: req.user!.userId, readAt: null },
    data: { readAt: new Date() },
  });
  res.status(204).end();
});

router.delete('/', async (req, res) => {
  await prisma.notification.deleteMany({ where: { userId: req.user!.userId } });
  res.status(204).end();
});

export default router;
