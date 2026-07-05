import { Router, Request, Response } from 'express';
import crypto from 'node:crypto';
import { z } from 'zod';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';

const router = Router();

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET_KEY || '';
const PAYSTACK_API = 'https://api.paystack.co';

router.post('/initialize', authenticate, validate(z.object({
  bookingId: z.string().min(1),
})), async (req: Request, res: Response) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.body.bookingId },
      include: { invoice: true },
    });
    if (!booking) {
      res.status(404).json({ error: 'Booking not found' });
      return;
    }
    if (booking.buyerId !== req.user!.userId) {
      res.status(403).json({ error: 'Not your booking' });
      return;
    }

    const existing = await prisma.paystackTransaction.findUnique({ where: { bookingId: booking.id } });
    if (existing && existing.status === 'success') {
      res.status(400).json({ error: 'Booking already paid' });
      return;
    }
    if (existing && existing.authorizationUrl) {
      res.json({ authorization_url: existing.authorizationUrl, reference: existing.reference });
      return;
    }

    const reference = `VP-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    const amountMinor = Math.round(booking.totalCost * 100);
    const callbackUrl = process.env.PAYSTACK_CALLBACK_URL || `${process.env.APP_BASE_URL || 'http://localhost:3000'}/booking`;

    const paystackRes = await fetch(`${PAYSTACK_API}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: req.user!.email,
        amount: amountMinor,
        reference,
        callback_url: callbackUrl,
        metadata: { bookingId: booking.id, userId: req.user!.userId },
      }),
    });

    const paystackData = await paystackRes.json() as { status: boolean; data?: { authorization_url: string; reference: string }; message?: string };
    if (!paystackRes.ok || !paystackData.status) {
      res.status(502).json({ error: paystackData.message || 'Payment gateway error' });
      return;
    }

    await prisma.paystackTransaction.upsert({
      where: { bookingId: booking.id },
      update: { reference, authorizationUrl: paystackData.data!.authorization_url, status: 'pending' },
      create: { bookingId: booking.id, reference, amount: amountMinor, authorizationUrl: paystackData.data!.authorization_url },
    });

    res.json({ authorization_url: paystackData.data!.authorization_url, reference: paystackData.data!.reference });
  } catch (err) {
    console.error('Payment initialize error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/webhook', async (req: Request, res: Response) => {
  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET).update(JSON.stringify(req.body)).digest('hex');
  if (hash !== req.headers['x-paystack-signature']) {
    res.status(401).send('Invalid signature');
    return;
  }

  const event = req.body as { event: string; data: { reference: string; status: string; metadata?: { bookingId: string } } };

  if (event.event === 'charge.success') {
    try {
      const tx = await prisma.paystackTransaction.findUnique({ where: { reference: event.data.reference } });
      if (tx && tx.status !== 'success') {
        await prisma.$transaction([
          prisma.paystackTransaction.update({
            where: { reference: event.data.reference },
            data: { status: 'success', paidAt: new Date() },
          }),
          prisma.invoice.updateMany({
            where: { bookingId: tx.bookingId },
            data: { status: 'PAID', paidAt: new Date() },
          }),
          prisma.booking.update({
            where: { id: tx.bookingId },
            data: { status: 'Live' },
          }),
        ]);
      }
    } catch (err) {
      console.error('Webhook processing error:', err);
      res.status(500).json({ error: 'Processing error' });
      return;
    }
  }

  res.status(200).end();
});

export default router;
