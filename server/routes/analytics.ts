import { Router } from 'express';
import { prisma } from '../db';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/impressions', async (_req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.impressionLog.findMany({
      where: { date: { gte: thirtyDaysAgo } },
      orderBy: { date: 'asc' },
    });

    const aggregated: Record<string, { date: string; impressions: number }> = {};
    for (const log of logs) {
      const key = log.date.toISOString().slice(0, 10);
      if (!aggregated[key]) aggregated[key] = { date: key, impressions: 0 };
      aggregated[key].impressions += log.count;
    }

    const series = Object.values(aggregated).sort((a, b) => a.date.localeCompare(b.date));
    const total = series.reduce((s, d) => s + d.impressions, 0);
    const avg = series.length > 0 ? Math.round(total / series.length) : 0;
    const peak = Math.max(...series.map(d => d.impressions), 0);
    const runRate = avg * 30;

    res.json({ series, summary: { total, average: avg, peak, runRate } });
  } catch (err) {
    console.error('Analytics error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
