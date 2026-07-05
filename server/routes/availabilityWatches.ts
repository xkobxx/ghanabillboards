import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireRole('buyer', 'admin'));

router.get('/', async (req, res) => {
  const watches = await prisma.availabilityWatch.findMany({
    where: { userId: req.user!.userId, active: true },
    include: { billboard: true },
    orderBy: { createdAt: 'desc' },
  });
  res.json(watches);
});

router.post('/:billboardId', async (req, res) => {
  const billboard = await prisma.billboard.findUnique({ where: { id: req.params.billboardId } });
  if (!billboard) {
    res.status(404).json({ error: 'Billboard not found' });
    return;
  }
  const watch = await prisma.availabilityWatch.upsert({
    where: { userId_billboardId: { userId: req.user!.userId, billboardId: billboard.id } },
    update: { active: true },
    create: { userId: req.user!.userId, billboardId: billboard.id },
  });
  res.status(201).json(watch);
});

router.delete('/:billboardId', async (req, res) => {
  await prisma.availabilityWatch.updateMany({
    where: { userId: req.user!.userId, billboardId: req.params.billboardId },
    data: { active: false },
  });
  res.status(204).end();
});

export default router;
