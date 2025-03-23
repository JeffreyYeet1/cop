"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Command } from 'lucide-react';

interface GeneralResponse {
  response: string;
  action_items: string[];
  timestamp: string;
}

interface ApiError {
  detail: string;
  message?: string;
}

export default function PekaCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<GeneralResponse | null>(null);
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
      setIsOpen(false);
      setResponse(null);
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

      const requestBody = {
        query: query.trim()
      };
      console.log('Request body:', requestBody);

      const response = await fetch('/api/peka/query', {
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
      console.log('Success response:', data);
      setResponse(data);
      setQuery(''); // Clear input after successful response
    } catch (error) {
      console.error('Error:', error);
      setResponse({
        response: error instanceof Error ? error.message : "Failed to process your request. Please try again.",
        action_items: [],
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
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