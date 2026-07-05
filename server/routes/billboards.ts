import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const createBillboardSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  location: z.string().min(1),
  city: z.string().min(1),
  country: z.string().min(1),
  dailyRate: z.number().positive(),
  format: z.string().min(1),
  dimensions: z.string().min(1),
  monthlyImpressions: z.string().min(1),
  trafficVolume: z.enum(['High', 'VeryHigh', 'Mega']),
  lat: z.number(),
  lng: z.number(),
  imageUrl: z.string().url(),
  description: z.string().min(1),
});

const updateBillboardSchema = createBillboardSchema.partial();
const availabilityQuerySchema = z.object({
  from: z.string().datetime({ offset: true }),
  to: z.string().datetime({ offset: true }),
}).refine(
  ({ from, to }) => new Date(from) < new Date(to),
  { path: ['to'], message: 'to must be after from' },
);

// Public: list all billboards
router.get('/', async (_req: Request, res: Response) => {
  const billboards = await prisma.billboard.findMany({
    orderBy: { createdAt: 'desc' },
  });
  res.json(billboards);
});

// Public: check whether a precise UTC interval can be booked.
router.get('/:id/availability', async (req: Request, res: Response) => {
  const query = availabilityQuerySchema.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({
      error: 'Validation failed',
      details: query.error.flatten().fieldErrors,
    });
    return;
  }

  const billboard = await prisma.billboard.findUnique({
    where: { id: req.params.id },
    select: { id: true, status: true },
  });
  if (!billboard) {
    res.status(404).json({ error: 'Billboard not found' });
    return;
  }

  const from = new Date(query.data.from);
  const to = new Date(query.data.to);
  const bookedSlots = await prisma.booking.findMany({
    where: {
      billboardId: billboard.id,
      status: { in: ['PendingApproved', 'Live'] },
      startAt: { lt: to },
      endAt: { gt: from },
    },
    select: {
      id: true,
      startAt: true,
      endAt: true,
      status: true,
    },
    orderBy: { startAt: 'asc' },
  });

  res.json({
    billboardId: billboard.id,
    from: from.toISOString(),
    to: to.toISOString(),
    available: billboard.status !== 'Maintenance' && bookedSlots.length === 0,
    reason: billboard.status === 'Maintenance' ? 'maintenance' : bookedSlots.length ? 'booked' : null,
    bookedSlots,
  });
});

// Public: get single billboard
router.get('/:id', async (req: Request, res: Response) => {
  const billboard = await prisma.billboard.findUnique({
    where: { id: req.params.id },
    include: { bookings: true },
  });
  if (!billboard) {
    res.status(404).json({ error: 'Billboard not found' });
    return;
  }
  res.json(billboard);
});

// Publisher/Admin: create billboard
router.post('/', authenticate, requireRole('publisher', 'admin'), validate(createBillboardSchema), async (req: Request, res: Response) => {
  const existing = await prisma.billboard.findUnique({ where: { id: req.body.id } });
  if (existing) {
    res.status(409).json({ error: 'Billboard with this ID already exists' });
    return;
  }

  const billboard = await prisma.billboard.create({ data: req.body });
  res.status(201).json(billboard);
});

// Publisher/Admin: update billboard
router.patch('/:id', authenticate, requireRole('publisher', 'admin'), validate(updateBillboardSchema), async (req: Request, res: Response) => {
  const billboard = await prisma.billboard.findUnique({ where: { id: req.params.id } });
  if (!billboard) {
    res.status(404).json({ error: 'Billboard not found' });
    return;
  }

  const updated = await prisma.billboard.update({
    where: { id: req.params.id },
    data: req.body,
  });
  res.json(updated);
});

// Publisher/Admin: delete billboard
router.delete('/:id', authenticate, requireRole('publisher', 'admin'), async (req: Request, res: Response) => {
  const billboard = await prisma.billboard.findUnique({ where: { id: req.params.id } });
  if (!billboard) {
    res.status(404).json({ error: 'Billboard not found' });
    return;
  }

  await prisma.billboard.delete({ where: { id: req.params.id } });
  res.status(204).send();
});

export default router;
