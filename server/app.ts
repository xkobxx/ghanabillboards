import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { generalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import billboardRoutes from './routes/billboards';
import bookingRoutes from './routes/bookings';
import buyerSettingsRoutes from './routes/buyerSettings';
import mfaRoutes from './routes/mfa';
import notificationRoutes from './routes/notifications';
import availabilityWatchRoutes from './routes/availabilityWatches';
import invoiceRoutes from './routes/invoices';
import creativeRoutes from './routes/creative';
import approvalRoutes from './routes/approvals';
import analyticsRoutes from './routes/analytics';
import paymentRoutes from './routes/payments';
import blogRoutes from './routes/blogs';

export function createApp() {
  const app = express();
  app.set('json replacer', (_key: string, value: unknown) =>
    typeof value === 'bigint' ? Number(value) : value);

  app.use(helmet());
  app.use(cors({
    origin: process.env.APP_BASE_URL || 'http://localhost:3000',
    credentials: true,
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));
  app.use(generalLimiter);

  app.use('/api/auth', authRoutes);
  app.use('/api/billboards', billboardRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/buyer/settings', buyerSettingsRoutes);
  app.use('/api/auth/mfa', mfaRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/availability-watches', availabilityWatchRoutes);
  app.use('/api/invoices', invoiceRoutes);
  app.use('/api/creative', creativeRoutes);
  app.use('/api/approvals', approvalRoutes);
  app.use('/api/analytics', analyticsRoutes);
  app.use('/api/payments', paymentRoutes);
  app.use('/api/blogs', blogRoutes);

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  return app;
}
