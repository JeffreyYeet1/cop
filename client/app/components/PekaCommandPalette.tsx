"use client";

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Sparkles, Command } from 'lucide-react';

export default function PekaCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<string | null>(null);
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
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setResponse("I'm Peka, your AI productivity assistant. I can help you analyze tasks, provide recommendations, and optimize your workflow. What would you like to know?");
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

      {/* Command Palette */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={handleClickOutside}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200"
            >
              <form onSubmit={handleSubmit} className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask Peka to help prioritize your tasks..."
                  className="w-full px-12 py-4 text-lg bg-transparent border-0 focus:outline-none focus:ring-0"
                  autoFocus
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <kbd className="px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded">
                    ⌘O
                  </kbd>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat Response */}
      <AnimatePresence>
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setResponse(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-200 p-6"
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-50 rounded-full">
                  <Sparkles className="text-blue-500" size={20} />
                </div>
                <div>
                  <p className="text-gray-800">{response}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
} 