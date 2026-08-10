import { api } from './client';
import { AnalyticsSummary } from './types';

export async function fetchAnalyticsSummary(): Promise<AnalyticsSummary> {
  const { data } = await api.get<AnalyticsSummary>('/analytics/summary');
  return data;
}
