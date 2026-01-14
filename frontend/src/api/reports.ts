import { apiFetch } from './apiFetch';

export async function getAnalytics() {
  return apiFetch('/reports/analytics');
}

export async function getPipelineMetrics() {
  return apiFetch('/reports/pipeline');
}

export async function getActivityTrends(days?: number) {
  const params = days ? `?days=${days}` : '';
  return apiFetch(`/reports/activity-trends${params}`);
}

export async function getUserPerformance() {
  return apiFetch('/reports/user-performance');
}
