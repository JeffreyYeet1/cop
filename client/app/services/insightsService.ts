import { api } from './api';

export interface PeriodMetrics {
  active_days: number; clarity_score: number | null; checkins: number;
  tasks_created: number; tasks_completed: number; focus_started: number;
  focus_completed: number; focus_minutes: number; completion_rate: number | null;
}
export interface HeartSummary {
  period: { start: string; end: string; timezone: string };
  current: PeriodMetrics; previous: PeriodMetrics;
  series: (PeriodMetrics & { date: string })[];
  heart: {
    happiness: { score: number | null; responses: number; previous_score: number | null };
    engagement: { active_days: number; previous_active_days: number };
    adoption: { first_task_at: string | null; first_focus_at: string | null };
    retention: { returned: boolean | null };
    task_success: { focus_started: number; focus_completed: number; completion_rate: number | null };
  };
}
export interface WeeklyReview {
  mode: 'ai' | 'getting_started';
  observations: { text: string; evidence_ids: string[] }[];
  experiment: string;
  evidence: { id: string; label: string; value: number; previous: number | null }[];
}
export interface FocusSession {
  id: string; planned_seconds: number; actual_seconds: number;
  status: 'active' | 'completed' | 'abandoned' | 'interrupted';
  reused?: boolean; started_at: string; ended_at: string | null;
}
const zone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;
export const insightsService = {
  summary: () => api<HeartSummary>(`/insights/summary?timezone=${encodeURIComponent(zone())}`),
  checkin: (score: number) => api('/insights/checkins', { method: 'POST', body: JSON.stringify({ score, timezone: zone() }) }),
  review: () => api<WeeklyReview>(`/insights/review?timezone=${encodeURIComponent(zone())}`, { method: 'POST' }),
  startFocus: (id: string, planned_seconds: number) => api<FocusSession>('/insights/focus', { method: 'POST', body: JSON.stringify({ id, planned_seconds }) }),
  heartbeat: (id: string, actual_seconds: number) => api<FocusSession>(`/insights/focus/${id}/heartbeat`, { method: 'POST', body: JSON.stringify({ actual_seconds }) }),
  finishFocus: (id: string, status: 'completed' | 'abandoned', actual_seconds: number) => api<FocusSession>(`/insights/focus/${id}`, { method: 'PATCH', body: JSON.stringify({ status, actual_seconds }) }),
};
