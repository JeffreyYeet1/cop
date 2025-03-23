import { Todo } from '../types/todo';

const API_BASE_URL = 'http://localhost:8000/api';

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
  // Get all todos
  getAllTodos: async (): Promise<Todo[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/todo`, {
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
  getTodo: async (id: number): Promise<Todo> => {
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
  createTodo: async (todo: Omit<Todo, 'id' | 'user_id' | 'created_at'>): Promise<Todo> => {
    try {
      const response = await fetch(`${API_BASE_URL}/todo`, {
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
  updateTodo: async (id: number, todo: Omit<Todo, 'id' | 'user_id' | 'created_at'>): Promise<Todo> => {
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