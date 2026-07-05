import { Router, type Request, type Response } from 'express';
import { prisma } from '../db';
import { authenticate, requireRole } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateBuyerSettingsSchema } from '../schemas/buyerSettings';

const router = Router();
router.use(authenticate, requireRole('buyer', 'admin'));

function serializeSettings(settings: {
  billingCurrency: string;
  defaultFlightDays: number;
  budgetCapMinor: bigint | null;
  approvalWorkflow: string;
  bookingStatusAlerts: boolean;
  availabilityAlerts: boolean;
  invoiceAlerts: boolean;
  sessionAlerts: boolean;
  creativeReviewRequired: boolean;
  version: number;
  user?: { mfaEnabled: boolean };
}) {
  return {
    billingCurrency: settings.billingCurrency,
    defaultFlightDays: settings.defaultFlightDays,
    budgetCapMinor: settings.budgetCapMinor === null ? null : Number(settings.budgetCapMinor),
    approvalWorkflow: settings.approvalWorkflow,
    bookingStatusAlerts: settings.bookingStatusAlerts,
    availabilityAlerts: settings.availabilityAlerts,
    invoiceAlerts: settings.invoiceAlerts,
    sessionAlerts: settings.sessionAlerts,
    creativeReviewRequired: settings.creativeReviewRequired,
    mfaEnabled: settings.user?.mfaEnabled ?? false,
    version: settings.version,
  };
}

router.get('/', async (req: Request, res: Response) => {
  const settings = await prisma.buyerSetting.upsert({
    where: { userId: req.user!.userId },
    update: {},
    create: { userId: req.user!.userId },
    include: { user: { select: { mfaEnabled: true } } },
  });
  res.json(serializeSettings(settings));
});

router.patch('/', validate(updateBuyerSettingsSchema), async (req: Request, res: Response) => {
  const { version, budgetCapMinor, ...changes } = req.body;
  const result = await prisma.buyerSetting.updateMany({
    where: { userId: req.user!.userId, version },
    data: {
      ...changes,
      ...(budgetCapMinor !== undefined
        ? { budgetCapMinor: budgetCapMinor === null ? null : BigInt(budgetCapMinor) }
        : {}),
      version: { increment: 1 },
    },
  });

  if (result.count === 0) {
    res.status(409).json({ error: 'Settings changed in another session. Reload and try again.' });
    return;
  }

  const settings = await prisma.buyerSetting.findUniqueOrThrow({
    where: { userId: req.user!.userId },
    include: { user: { select: { mfaEnabled: true } } },
  });
  res.json(serializeSettings(settings));
});

export default router;
