export type Priority = 'low' | 'medium' | 'high';

export interface Todo {
  id: number;
  user_id: number;
  title: string;
  description: string;
  priority: Priority;
  estimated_duration?: number;
  created_at: string;
} 