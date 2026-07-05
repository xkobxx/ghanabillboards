import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { generateSecret, generateURI, verify } from 'otplib';
import { prisma } from '../db';
import { decryptSecret, encryptSecret } from '../lib/secretEncryption';

export async function startMfaEnrollment(userId: string, email: string) {
  const secret = generateSecret();
  await prisma.mfaFactor.upsert({
    where: { userId },
    update: { encryptedSecret: encryptSecret(secret), confirmedAt: null, lastUsedTimeStep: null },
    create: { userId, encryptedSecret: encryptSecret(secret) },
  });
  return {
    secret,
    uri: generateURI({ issuer: 'Vantage Point', label: email, secret }),
  };
}

export async function verifyTotp(userId: string, token: string) {
  const factor = await prisma.mfaFactor.findUnique({ where: { userId } });
  if (!factor) return false;
  const currentStep = Math.floor(Date.now() / 30_000);
  const result = await verify({
    secret: decryptSecret(factor.encryptedSecret),
    token,
    epochTolerance: 30,
    afterTimeStep: factor.lastUsedTimeStep === null ? undefined : Number(factor.lastUsedTimeStep),
  });
  if (!result.valid) return false;
  await prisma.mfaFactor.update({
    where: { userId },
    data: { lastUsedTimeStep: BigInt(currentStep) },
  });
  return true;
}

export async function confirmMfaEnrollment(userId: string, token: string) {
  if (!await verifyTotp(userId, token)) return null;
  const codes = Array.from({ length: 8 }, () => randomBytes(5).toString('hex').toUpperCase());
  await prisma.$transaction([
    prisma.mfaFactor.update({ where: { userId }, data: { confirmedAt: new Date() } }),
    prisma.user.update({ where: { id: userId }, data: { mfaEnabled: true } }),
    prisma.mfaRecoveryCode.deleteMany({ where: { factorId: userId } }),
    ...codes.map((code) => prisma.mfaRecoveryCode.create({
      data: { factorId: userId, codeHash: bcrypt.hashSync(code, 10) },
    })),
  ]);
  return codes;
}

export async function verifyMfaOrRecovery(userId: string, token: string) {
  if (/^\d{6,8}$/.test(token) && await verifyTotp(userId, token)) return true;
  const codes = await prisma.mfaRecoveryCode.findMany({ where: { factorId: userId, usedAt: null } });
  for (const code of codes) {
    if (await bcrypt.compare(token.toUpperCase(), code.codeHash)) {
      await prisma.mfaRecoveryCode.update({ where: { id: code.id }, data: { usedAt: new Date() } });
      return true;
    }
  }
  return false;
}
