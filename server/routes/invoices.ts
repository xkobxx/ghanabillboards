import { Router } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';

const router = Router();
router.use(authenticate, requireRole('buyer', 'admin'));

router.get('/', async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    where: req.user!.role === 'admin' ? {} : { booking: { buyerId: req.user!.userId } },
    include: { booking: { select: { campaignName: true, billboardId: true } } },
    orderBy: { issuedAt: 'desc' },
  });
  res.json(invoices.map((invoice) => ({
    ...invoice,
    totalMinor: Number(invoice.totalMinor),
  })));
});

export default router;
