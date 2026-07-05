import { createHash } from 'node:crypto';
import type { Request } from 'express';
import { prisma } from '../db';

function requestContext(req: Request) {
  const userAgent = String(req.get('user-agent') || 'Unknown device').slice(0, 300);
  const rawIp = req.ip || req.socket.remoteAddress || 'unknown';
  const ipPrefix = rawIp.includes(':')
    ? rawIp.split(':').slice(0, 4).join(':')
    : rawIp.split('.').slice(0, 3).join('.');
  const deviceHash = createHash('sha256').update(`${userAgent}|${ipPrefix}`).digest('hex');
  return { userAgent, ipPrefix, deviceHash };
}

export async function recordSession(req: Request, userId: string) {
  const context = requestContext(req);
  const existing = await prisma.authSession.findUnique({
    where: { userId_deviceHash: { userId, deviceHash: context.deviceHash } },
  });
  const priorSessions = existing ? 1 : await prisma.authSession.count({ where: { userId } });

  await prisma.authSession.upsert({
    where: { userId_deviceHash: { userId, deviceHash: context.deviceHash } },
    update: { lastSeenAt: new Date(), userAgent: context.userAgent, ipPrefix: context.ipPrefix },
    create: { userId, ...context },
  });

  if (!existing && priorSessions > 0) {
    const settings = await prisma.buyerSetting.findUnique({ where: { userId } });
    if (settings?.sessionAlerts !== false) {
      await prisma.notification.create({
        data: {
          userId,
          type: 'session.new-device',
          title: 'New sign-in detected',
          body: `${context.userAgent} · network ${context.ipPrefix}`,
        },
      });
    }
  }
}
