// Task Types
export type Priority = 'low' | 'medium' | 'high';
export type TaskProgress = 'not_started' | 'in_progress' | 'completed';

export interface Task {
  id: number;
  user_id: number;
  title: string;
  description: string;
  priority: Priority;
  estimated_duration?: number;
  created_at: string;
  progress?: TaskProgress;
}

export interface TaskDetails {
  title: string;
  description: string;
  priority: Priority;
  estimated_duration: number;
  task_id?: number;
}

// Peka Response Types
export interface UnifiedResponse {
  intent: 'create' | 'analyze' | 'general';
  task_details?: TaskDetails;
  message: string;
  action_items: string[];
  timestamp: string;
}

export interface TaskRecommendation {
  task_id: number;
  reason: string;
}

export interface PekaResponse {
  sorted_tasks: number[];
  top_recommendation: TaskRecommendation;
  explanation: string;
}

export interface GeneralResponse {
  response: string;
  action_items: string[];
  timestamp: string;
} 