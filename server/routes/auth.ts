import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate, signMfaToken, signToken, verifyMfaToken } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { validate } from '../middleware/validate';
import { verifyMfaOrRecovery } from '../services/mfaService';
import { recordSession } from '../services/sessionService';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';

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

const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  location: z.string().optional(),
  website: z.string().optional(),
  avatar: z.string().optional(),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

const deleteAccountSchema = z.object({
  password: z.string().min(1),
});

const emailVerifyConfirmSchema = z.object({
  token: z.string().min(1),
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

    const adminEmail = process.env.ADMIN_REGISTRATION_EMAIL || 'admin@vantage.africa';
    if (role === 'admin' && email !== adminEmail) {
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
    select: { id: true, email: true, name: true, role: true, company: true, avatar: true, bio: true, phone: true, location: true, website: true, emailVerified: true, mfaEnabled: true, createdAt: true },
  });
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

router.patch('/me', authenticate, validate(updateProfileSchema), async (req: Request, res: Response) => {
  try {
    const allowed = ['name', 'company', 'phone', 'bio', 'location', 'website', 'avatar'];
    const data: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) data[key] = req.body[key];
    }
    if (Object.keys(data).length === 0) {
      res.status(400).json({ error: 'No valid fields to update' });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data,
    });
    res.json(publicUser(user));
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/password', authenticate, validate(changePasswordSchema), async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const valid = await bcrypt.compare(req.body.currentPassword, user.password);
    if (!valid) {
      res.status(403).json({ error: 'Current password is incorrect' });
      return;
    }
    const hashed = await bcrypt.hash(req.body.newPassword, 12);
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } });
    res.status(204).end();
  } catch (err) {
    console.error('Change password error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.delete('/me', authenticate, validate(deleteAccountSchema), async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    const valid = await bcrypt.compare(req.body.password, user.password);
    if (!valid) {
      res.status(403).json({ error: 'Password is incorrect' });
      return;
    }
    await prisma.user.delete({ where: { id: user.id } });
    res.status(204).end();
  } catch (err) {
    console.error('Delete account error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify-email', authenticate, async (_req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: _req.user!.userId } });
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (user.emailVerified) {
      res.status(400).json({ error: 'Email already verified' });
      return;
    }
    const verifyToken = jwt.sign({ userId: user.id, purpose: 'email-verify' }, JWT_SECRET, { expiresIn: '24h' });
    const baseUrl = process.env.APP_BASE_URL || 'http://localhost:3000';
    const verifyUrl = `${baseUrl}/verify-email?token=${verifyToken}`;
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'noreply@vantagepoint.africa',
        to: user.email,
        subject: 'Verify your email address',
        html: `<p>Click <a href="${verifyUrl}">here</a> to verify your email address. This link expires in 24 hours.</p>`,
      });
    } catch {
      // ponytail: resend not configured — return the token directly for dev
      res.json({ token: verifyToken });
      return;
    }
    res.json({ sent: true });
  } catch (err) {
    console.error('Verify email error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/verify-email/confirm', authenticate, validate(emailVerifyConfirmSchema), async (req: Request, res: Response) => {
  try {
    const payload = jwt.verify(req.body.token, JWT_SECRET) as { userId: string; purpose?: string };
    if (payload.purpose !== 'email-verify' || payload.userId !== req.user!.userId) {
      res.status(400).json({ error: 'Invalid or expired verification token' });
      return;
    }
    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: { emailVerified: true },
    });
    res.json(publicUser(user));
  } catch {
    res.status(400).json({ error: 'Invalid or expired verification token' });
  }
});

export default router;
