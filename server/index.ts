import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { generalLimiter } from './middleware/rateLimiter';
import authRoutes from './routes/auth';
import billboardRoutes from './routes/billboards';
import bookingRoutes from './routes/bookings';

const app = express();
const PORT = Number(process.env.GATEWAY_PORT) || 4000;

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

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Gateway running on http://localhost:${PORT}`);
});
