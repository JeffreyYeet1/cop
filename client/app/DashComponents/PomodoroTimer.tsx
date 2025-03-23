"use client";

import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Settings, X } from 'lucide-react';

interface TimerSettings {
  pomodoro: number;
  shortBreak: number;
  longBreak: number;
}

const PomodoroTimer: React.FC = () => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [selectedMode, setSelectedMode] = useState<'Pomodoro' | 'Short Break' | 'Long Break'>('Pomodoro');
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<TimerSettings>({
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            setIsActive(false);
            // Timer completed
            return;
          }
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [isActive, minutes, seconds]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    switch (selectedMode) {
      case 'Pomodoro':
        setMinutes(settings.pomodoro);
        break;
      case 'Short Break':
        setMinutes(settings.shortBreak);
        break;
      case 'Long Break':
        setMinutes(settings.longBreak);
        break;
    }
    setSeconds(0);
  };

  const switchMode = (mode: 'Pomodoro' | 'Short Break' | 'Long Break') => {
    setSelectedMode(mode);
    setIsActive(false);
    switch (mode) {
      case 'Pomodoro':
        setMinutes(settings.pomodoro);
        break;
      case 'Short Break':
        setMinutes(settings.shortBreak);
        break;
      case 'Long Break':
        setMinutes(settings.longBreak);
        break;
    }
    setSeconds(0);
  };

  const updateSettings = (key: keyof TimerSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const saveSettings = () => {
    resetTimer();
    setShowSettings(false);
  };

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-sky-100 shadow-[0_0_50px_0_rgba(0,0,0,0.05)] p-12 transition-all duration-300 hover:shadow-[0_0_50px_0_rgba(0,0,0,0.08)]">
      <div className="flex flex-col items-center justify-center space-y-10">
        {/* Mode Selection */}
        <div className="flex space-x-4 bg-sky-50/50 p-1.5 rounded-2xl">
          {['Pomodoro', 'Short Break', 'Long Break'].map((mode) => (
            <button
              key={mode}
              onClick={() => switchMode(mode as 'Pomodoro' | 'Short Break' | 'Long Break')}
              className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedMode === mode
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-sky-600 hover:bg-white hover:shadow-sm'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Timer Display */}
        <div className="relative transform transition-transform duration-300 hover:scale-105">
          <svg className="w-72 h-72">
            <circle
              className="text-sky-100"
              strokeWidth="6"
              stroke="currentColor"
              fill="none"
              r="130"
              cx="144"
              cy="144"
            />
            <circle
              className="text-sky-500"
              strokeWidth="6"
              stroke="currentColor"
              fill="none"
              r="130"
              cx="144"
              cy="144"
              style={{
                strokeDasharray: 817,
                strokeDashoffset: 817 * (1 - (minutes * 60 + seconds) / (settings.pomodoro * 60)),
                strokeLinecap: 'round',
                transform: 'rotate(-90deg)',
                transformOrigin: '50% 50%',
              }}
            />
          </svg>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="text-6xl font-bold text-gray-900 tracking-tight">
              {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center space-x-6">
          <button
            onClick={toggleTimer}
            className="p-4 rounded-2xl bg-sky-500 text-white hover:bg-sky-600 transition-all duration-300 hover:shadow-lg transform hover:-translate-y-0.5"
          >
            {isActive ? <Pause size={28} /> : <Play size={28} />}
          </button>
          <button
            onClick={resetTimer}
            className="p-4 rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5"
          >
            <RotateCcw size={28} />
          </button>
          <button
            onClick={() => setShowSettings(true)}
            className="p-4 rounded-2xl bg-sky-50 text-sky-600 hover:bg-sky-100 transition-all duration-300 hover:shadow-md transform hover:-translate-y-0.5"
          >
            <Settings size={28} />
          </button>
        </div>

        <div className="text-sm text-sky-600">
          Focus on your task until the timer ends.
        </div>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 w-[400px] shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Timer Settings</h3>
              <button onClick={() => setShowSettings(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pomodoro Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.pomodoro}
                  onChange={(e) => updateSettings('pomodoro', Math.max(1, parseInt(e.target.value)))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Short Break Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.shortBreak}
                  onChange={(e) => updateSettings('shortBreak', Math.max(1, parseInt(e.target.value)))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Long Break Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.longBreak}
                  onChange={(e) => updateSettings('longBreak', Math.max(1, parseInt(e.target.value)))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
                  min="1"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={saveSettings}
                className="px-6 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all duration-300"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PomodoroTimer;