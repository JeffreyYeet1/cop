"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Settings } from 'lucide-react';

// Define types
type TimerMode = 'pomodoro' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

const PomodoroTimer: React.FC = () => {
  // Default timer settings in minutes
  const defaultSettings: TimerSettings = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  };

  const [settings, setSettings] = useState<TimerSettings>(defaultSettings);
  const [mode, setMode] = useState<TimerMode>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(settings.pomodoro * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState<TimerSettings>(settings);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Update timer when mode changes
  useEffect(() => {
    setTimeLeft(settings[mode] * 60);
    setIsRunning(false);
    
    // Clear any existing timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [mode, settings]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            // Timer finished
            setIsRunning(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTempSettings({
      ...tempSettings,
      [name]: parseInt(value)
    });
  };

  const saveSettings = () => {
    setSettings(tempSettings);
    setShowSettings(false);
  };

  const calculateProgress = (): number => {
    const total = settings[mode] * 60;
    return ((total - timeLeft) / total) * 100;
  };

  return (
    <div className="bg-white rounded-3xl shadow-md p-8 max-w-md mx-auto">
      {/* Timer Mode Selector */}
      <div className="flex justify-center mb-8">
        <div className="bg-gray-100 p-1 rounded-full flex">
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'pomodoro' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setMode('pomodoro')}
          >
            Pomodoro
          </button>
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'shortBreak' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setMode('shortBreak')}
          >
            Short Break
          </button>
          <button 
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${mode === 'longBreak' ? 'bg-white shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            onClick={() => setMode('longBreak')}
          >
            Long Break
          </button>
        </div>
      </div>

      {/* Timer Display */}
      <div className="relative mb-8">
        <div className="w-64 h-64 mx-auto rounded-full flex items-center justify-center bg-gray-50 border-8 border-gray-100">
          <div className="text-5xl font-bold text-gray-800">
            {formatTime(timeLeft)}
          </div>
        </div>
        
        {/* Progress Circle */}
        <svg className="absolute top-0 left-1/2 transform -translate-x-1/2" width="280" height="280">
          <circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke="#E5E7EB"
            strokeWidth="8"
          />
          <circle
            cx="140"
            cy="140"
            r="130"
            fill="none"
            stroke="#3B82F6"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 130}`}
            strokeDashoffset={`${2 * Math.PI * 130 * (1 - calculateProgress() / 100)}`}
            transform="rotate(-90 140 140)"
          />
        </svg>
      </div>

      {/* Timer Controls */}
      <div className="flex justify-center space-x-4 mb-6">
        <button 
          className="p-3 rounded-full bg-blue-500 text-white hover:bg-blue-600 transition-colors"
          onClick={toggleTimer}
        >
          {isRunning ? <Pause size={24} /> : <Play size={24} />}
        </button>
        <button 
          className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          onClick={resetTimer}
        >
          <RotateCcw size={24} />
        </button>
        <button 
          className="p-3 rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
          onClick={() => {
            setTempSettings(settings);
            setShowSettings(true);
          }}
        >
          <Settings size={24} />
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-96 max-w-full">
            <h3 className="text-xl font-semibold mb-4">Timer Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pomodoro (minutes)
                </label>
                <input
                  type="number"
                  name="pomodoro"
                  min="1"
                  max="60"
                  value={tempSettings.pomodoro}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Short Break (minutes)
                </label>
                <input
                  type="number"
                  name="shortBreak"
                  min="1"
                  max="30"
                  value={tempSettings.shortBreak}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Long Break (minutes)
                </label>
                <input
                  type="number"
                  name="longBreak"
                  min="1"
                  max="60"
                  value={tempSettings.longBreak}
                  onChange={handleSettingsChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                onClick={() => setShowSettings(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={saveSettings}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Timer Description */}
      <div className="text-center text-gray-600 text-sm">
        {mode === 'pomodoro' && (
          <p>Focus on your task until the timer ends.</p>
        )}
        {mode === 'shortBreak' && (
          <p>Take a short break to refresh your mind.</p>
        )}
        {mode === 'longBreak' && (
          <p>Take a longer break to recharge.</p>
        )}
      </div>
    </div>
  );
};

export default PomodoroTimer;