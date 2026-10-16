import { Task } from '../types';
import { api } from './api';

const API_BASE_URL = `${(process.env.NEXT_PUBLIC_API_URL || '').replace(/\/$/, '')}/api`;

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const todoService = {
  setCompletion: (id: number, completed: boolean) => api<Task>(`/todo/${id}/completion`, { method: 'PATCH', body: JSON.stringify({ completed }) }),
  // Get all todos
  getAllTodos: async (): Promise<Task[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/todo/`, {
        headers: getAuthHeader()
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error('Failed to fetch todos');
      }
      return response.json();
    } catch (error) {
      console.error('Error in getAllTodos:', error);
      throw error;
    }
  },

  // Get a single todo
  getTodo: async (id: number): Promise<Task> => {
    try {
      const response = await fetch(`${API_BASE_URL}/todo/${id}`, {
        headers: getAuthHeader()
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error('Failed to fetch todo');
      }
      return response.json();
    } catch (error) {
      console.error('Error in getTodo:', error);
      throw error;
    }
  },

  // Create a new todo
  createTodo: async (todo: Omit<Task, 'id' | 'user_id' | 'created_at'>): Promise<Task> => {
    try {
      const response = await fetch(`${API_BASE_URL}/todo/`, {
        method: 'POST',
        headers: getAuthHeader(),
        body: JSON.stringify(todo),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error('Failed to create todo');
      }
      return response.json();
    } catch (error) {
      console.error('Error in createTodo:', error);
      throw error;
    }
  },

  // Update a todo
  updateTodo: async (id: number, todo: Partial<Task>): Promise<Task> => {
    try {
      const response = await fetch(`${API_BASE_URL}/todo/${id}`, {
        method: 'PUT',
        headers: getAuthHeader(),
        body: JSON.stringify(todo),
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error('Failed to update todo');
      }
      return response.json();
    } catch (error) {
      console.error('Error in updateTodo:', error);
      throw error;
    }
  },

  // Delete a todo
  deleteTodo: async (id: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/todo/${id}`, {
        method: 'DELETE',
        headers: getAuthHeader()
      });
      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed');
        }
        throw new Error('Failed to delete todo');
      }
    } catch (error) {
      console.error('Error in deleteTodo:', error);
      throw error;
    }
  },
}; 