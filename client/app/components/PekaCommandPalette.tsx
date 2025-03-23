"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles } from 'lucide-react';
import { UnifiedResponse } from '../types';

export default function PekaCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<UnifiedResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

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
      handleClose();
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

      const response = await fetch('http://localhost:8000/api/peka/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: query.trim() })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Request failed');
      }

      const data = await response.json();
      setResponse(data);

      // If this was a task creation, emit an event to refresh the tasks list
      if (data.intent === 'create' && data.task_details?.task_id) {
        const event = new CustomEvent('taskUpdated', {
          detail: { type: 'created', task: data.task_details }
        });
        window.dispatchEvent(event);
      }

      // Clear the query but keep the chat open
      setQuery('');
    } catch (error) {
      setResponse({
        intent: 'general',
        task_details: {
          title: '',
          description: '',
          priority: 'low',
          estimated_duration: 30
        },
        message: error instanceof Error ? error.message : "Failed to process your request. Please try again.",
        action_items: [],
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    setResponse(null);
    window.location.reload();
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours === 1 ? '' : 's'} ago`;
    } else if (diffInSeconds < 604800) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days === 1 ? '' : 's'} ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  const renderResponse = () => {
    if (!response) return null;

    return (
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-50 rounded-full">
          <Sparkles className="text-blue-500" size={20} />
        </div>
        <div className="flex-1">
          <p className="text-gray-800">{response.message}</p>
          
          {response.intent === 'create' && response.task_details?.title && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Created Task:</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-800">{response.task_details.title}</p>
                <p className="text-gray-600 text-sm mt-1">{response.task_details.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    response.task_details.priority === 'high' ? 'bg-red-100 text-red-800' :
                    response.task_details.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {response.task_details.priority}
                  </span>
                  <span className="text-gray-500 text-xs">
                    {response.task_details.estimated_duration} minutes
                  </span>
                </div>
              </div>
            </div>
          )}

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
            {formatRelativeTime(response.timestamp)}
          </p>
        </div>
      </div>
    );
  };

  return (
    <>


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
                  <div className="absolute right-4 top-1/2 -translate-y-1/2">
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