import { apiRequest } from './apiClient';

interface ImpressionDay {
  date: string;
  impressions: number;
}

interface AnalyticsSummary {
  total: number;
  average: number;
  peak: number;
  runRate: number;
}

export interface AnalyticsData {
  series: ImpressionDay[];
  summary: AnalyticsSummary;
}

export const analyticsApi = {
  impressions: () => apiRequest<AnalyticsData>('/api/analytics/impressions'),
};
