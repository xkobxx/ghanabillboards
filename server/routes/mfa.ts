import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { confirmMfaEnrollment, startMfaEnrollment, verifyMfaOrRecovery } from '../services/mfaService';

const router = Router();
router.use(authenticate);

router.post('/enroll', async (req, res) => {
  const enrollment = await startMfaEnrollment(req.user!.userId, req.user!.email);
  res.status(201).json(enrollment);
});

router.post('/confirm', validate(z.object({ token: z.string().min(6).max(16) })), async (req, res) => {
  const recoveryCodes = await confirmMfaEnrollment(req.user!.userId, req.body.token);
  if (!recoveryCodes) {
    res.status(400).json({ error: 'Invalid or expired authenticator code' });
    return;
  }
  res.json({ enabled: true, recoveryCodes });
});

router.delete('/', validate(z.object({ token: z.string().min(6).max(32) })), async (req, res) => {
  if (!await verifyMfaOrRecovery(req.user!.userId, req.body.token)) {
    res.status(400).json({ error: 'Authenticator or recovery code is invalid' });
    return;
  }
  await prisma.$transaction([
    prisma.mfaFactor.delete({ where: { userId: req.user!.userId } }),
    prisma.user.update({ where: { id: req.user!.userId }, data: { mfaEnabled: false } }),
  ]);
  res.status(204).end();
});

export default router;
