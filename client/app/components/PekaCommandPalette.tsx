"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Command } from 'lucide-react';

interface GeneralResponse {
  response: string;
  action_items: string[];
  timestamp: string;
}

interface Task {
  id: number;
  user_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_duration: number;
  created_at: string;
  progress: 'not_started' | 'in_progress' | 'completed';
}

interface TaskResponse {
  sorted_tasks: number[];
  top_recommendation: {
    task_id: number;
    reason: string;
  };
  explanation: string;
}

interface TaskCreationResponse {
  task_id: number;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  estimated_duration: number;
  message: string;
}

interface ApiError {
  detail: string;
  message?: string;
}

export default function PekaCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<GeneralResponse | TaskResponse | TaskCreationResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  // Keywords that indicate different intents
  const taskAnalysisKeywords = [
    'organize', 'organise', 'sort', 'prioritize', 'prioritise',
    'arrange', 'order', 'manage', 'plan', 'schedule',
    'tasks', 'todo', 'to-do', 'todos', 'to-dos'
  ];

  const taskCreationKeywords = [
    'create', 'add', 'new', 'make', 'set up',
    'schedule', 'add to my list', 'add to my tasks',
    'remind me to', 'need to', 'should', 'have to'
  ];

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'o' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen(open => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleClickOutside = (e: React.MouseEvent) => {
    if (overlayRef.current === e.target) {
      setIsOpen(false);
      setResponse(null);
    }
  };

  const detectQueryIntent = (query: string): 'analyze' | 'create' | 'general' => {
    const lowerQuery = query.toLowerCase();
    
    if (taskAnalysisKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'analyze';
    }
    
    if (taskCreationKeywords.some(keyword => lowerQuery.includes(keyword))) {
      return 'create';
    }
    
    return 'general';
  };

  const fetchUserTasks = async (token: string): Promise<Task[]> => {
    try {
      console.log('Fetching tasks from server...');
      const response = await fetch('http://localhost:8000/api/todo/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch tasks:', errorData);
        throw new Error(errorData.detail || 'Failed to fetch tasks');
      }

      const data = await response.json();
      console.log('Fetched tasks:', data);
      return data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      console.log('Sending query to Peka:', query.trim());
      console.log('Using token:', token.substring(0, 10) + '...');

      const intent = detectQueryIntent(query.trim());
      let requestBody;

      if (intent === 'analyze') {
        // Fetch user's tasks first
        const tasks = await fetchUserTasks(token);
        // Format tasks to match server's expected schema
        requestBody = {
          tasks: tasks.map(task => ({
            id: task.id,
            user_id: String(task.user_id),
            title: task.title,
            description: task.description,
            priority: task.priority,
            estimated_duration: task.estimated_duration || 0,
            created_at: task.created_at,
            progress: task.progress || 'not_started'
          }))
        };
      } else {
        requestBody = { query: query.trim() };
      }

      console.log('Request body:', JSON.stringify(requestBody, null, 2));

      // Determine which endpoint to use based on query intent
      const endpoint = intent === 'analyze' 
        ? 'http://localhost:8000/api/peka/analyze'
        : intent === 'create'
        ? 'http://localhost:8000/api/peka/create-task'
        : 'http://localhost:8000/api/peka/query';

      console.log('Using endpoint:', endpoint);
      console.log('Detected intent:', intent);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(requestBody)
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        console.log('Response content-type:', contentType);
        
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json() as ApiError;
          console.log('Error data:', errorData);
          throw new Error(errorData.detail || 'Failed to get response');
        } else {
          const text = await response.text();
          console.log('Non-JSON response:', text);
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        }
      }
      
      const data = await response.json();
      console.log('Raw response data:', data);
      console.log('Response type:', typeof data);
      console.log('Response keys:', Object.keys(data));

      // Ensure the response matches our expected format
      if (intent === 'analyze' && !('sorted_tasks' in data)) {
        console.error('Invalid analyze response format:', data);
        throw new Error('Invalid response format from analyze endpoint');
      }

      setResponse(data);
      setQuery(''); // Clear input after successful response
    } catch (error) {
      console.error('Error:', error);
      setResponse({
        response: error instanceof Error ? error.message : "Failed to process your request. Please try again.",
        action_items: [],
        timestamp: new Date().toISOString()
      } as GeneralResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const renderResponse = () => {
    if (!response) return null;

    if ('action_items' in response) {
      // General response
      return (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <Sparkles className="text-blue-500" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-gray-800">{response.response}</p>
            {response.action_items.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Action Items:</h4>
                <ul className="list-disc list-inside space-y-1">
                  {response.action_items.map((item, index) => (
                    <li key={index} className="text-gray-600 text-sm">{item}</li>
                  ))}
                </ul>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-4">
              {new Date(response.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      );
    } else if ('sorted_tasks' in response) {
      // Task analysis response
      return (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <Sparkles className="text-blue-500" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-gray-800">{response.explanation}</p>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Top Recommendation:</h4>
              <p className="text-gray-600 text-sm">{response.top_recommendation.reason}</p>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Task Order:</h4>
              <ol className="list-decimal list-inside space-y-1">
                {response.sorted_tasks.map((taskId, index) => (
                  <li key={index} className="text-gray-600 text-sm">Task {taskId}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      );
    } else {
      // Task creation response
      return (
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 rounded-full">
            <Sparkles className="text-blue-500" size={20} />
          </div>
          <div className="flex-1">
            <p className="text-gray-800">{response.message}</p>
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Created Task:</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800">{response.title}</p>
                <p className="text-gray-600 text-sm mt-1">{response.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    response.priority === 'high' ? 'bg-red-100 text-red-800' :
                    response.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {response.priority}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {response.estimated_duration} minutes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  return (
    <>
      {/* Persistent Indicator */}
      <div className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-gray-200 px-4 py-2 flex items-center gap-2 text-sm text-gray-600">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <span>Press</span>
        <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">⌘O</kbd>
        <span>to talk to Peka</span>
      </div>

      {/* Command Palette and Chat Response Container */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-start justify-center p-4 pt-[20vh]"
            onClick={handleClickOutside}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl flex flex-col gap-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Command Input */}
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200">
                <form onSubmit={handleSubmit} className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask Peka anything about productivity..."
                    className="w-full px-12 py-4 text-lg bg-transparent border-0 focus:outline-none focus:ring-0"
                    autoFocus
                    disabled={isLoading}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                      ⌘O
                    </kbd>
                  </div>
                </form>
              </div>

              {/* Chat Response */}
              <AnimatePresence mode="wait">
                {response && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
                  >
                    {renderResponse()}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 