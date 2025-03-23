export type Priority = 'low' | 'medium' | 'high';

export interface Task {
  id: number;
  title: string;
  description: string;
  priority: Priority;
  estimated_duration: number;
  completed: boolean;
  created_at: string;
} 