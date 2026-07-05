import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate, signMfaToken, signToken, verifyMfaToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { verifyMfaOrRecovery } from '../services/mfaService';
import { recordSession } from '../services/sessionService';

const router = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(1),
  role: z.enum(['buyer', 'publisher', 'admin', 'investor']),
  company: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const mfaLoginSchema = z.object({
  mfaToken: z.string().min(1),
  token: z.string().min(6).max(32),
});

function publicUser(user: {
  id: string;
  email: string;
  name: string;
  role: string;
  company: string | null;
  avatar?: string | null;
  bio?: string | null;
  phone?: string | null;
  location?: string | null;
  website?: string | null;
  mfaEnabled?: boolean;
}) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    company: user.company,
    avatar: user.avatar,
    bio: user.bio,
    phone: user.phone,
    location: user.location,
    website: user.website,
    mfaEnabled: user.mfaEnabled,
  };
}

router.post('/register', authLimiter, validate(registerSchema), async (req: Request, res: Response) => {
  try {
    const { email, password, name, role, company } = req.body;

    // ponytail: only demo@vantage.africa can auto-register as admin; real admin provisioning is manual
    if (role === 'admin' && !email.endsWith('@vantage.africa')) {
      res.status(403).json({ error: 'Admin accounts require manual provisioning' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name, role, company },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    await recordSession(req, user.id);
    res.status(201).json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login', authLimiter, validate(loginSchema), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    if (user.mfaEnabled) {
      res.status(202).json({ mfaRequired: true, mfaToken: signMfaToken(user.id) });
      return;
    }

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    await recordSession(req, user.id);
    res.json({
      token,
      user: publicUser(user),
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/login/mfa', authLimiter, validate(mfaLoginSchema), async (req: Request, res: Response) => {
  const challenge = verifyMfaToken(req.body.mfaToken);
  if (!challenge || !await verifyMfaOrRecovery(challenge.userId, req.body.token)) {
    res.status(401).json({ error: 'Invalid or expired authentication code' });
    return;
  }
  const user = await prisma.user.findUnique({ where: { id: challenge.userId } });
  if (!user) {
    res.status(401).json({ error: 'Invalid authentication challenge' });
    return;
  }
  const token = signToken({ userId: user.id, email: user.email, role: user.role });
  await recordSession(req, user.id);
  res.json({ token, user: publicUser(user) });
});

router.get('/me', authenticate, async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, email: true, name: true, role: true, company: true, avatar: true, bio: true, phone: true, location: true, website: true, mfaEnabled: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

export default router;
