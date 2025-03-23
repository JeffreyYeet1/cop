'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '../AppShell';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [tasks, setTasks] = useState([]);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch('http://localhost:8000/api/todo/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch tasks');
      }

      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Check if user is authenticated and fetch initial tasks
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    } else {
      setIsLoading(false);
      fetchTasks();
    }
  }, [router]);

  // Listen for task updates
  useEffect(() => {
    const handleTaskUpdate = (event: CustomEvent) => {
      if (event.detail.type === 'created') {
        fetchTasks();
      }
    };

    window.addEventListener('taskUpdated', handleTaskUpdate as EventListener);
    return () => {
      window.removeEventListener('taskUpdated', handleTaskUpdate as EventListener);
    };
  }, []);

  if (isLoading) {
    return (
      <AppShell>
        <div className="h-screen w-full flex items-center justify-center">
          {/* Optional loading spinner */}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
        <p>Welcome to your personalized dashboard!</p>
        
        {/* Display tasks */}
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">Your Tasks</h2>
          <div className="space-y-4">
            {tasks.map((task: any) => (
              <div key={task.id} className="bg-white p-4 rounded-lg shadow">
                <h3 className="font-medium">{task.title}</h3>
                <p className="text-gray-600">{task.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className={`px-2 py-1 rounded text-sm ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {task.priority}
                  </span>
                  <span className="text-sm text-gray-500">
                    {task.estimated_duration} minutes
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}