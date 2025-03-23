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
    <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-xl border border-violet-100 transform transition-all duration-1000 hover:shadow-2xl hover:scale-[1.02]">
      {/* Mode Selection */}
      <div className="flex justify-center mb-8 bg-violet-50/50 rounded-2xl p-1">
        {['Pomodoro', 'Short Break', 'Long Break'].map((mode) => (
          <button
            key={mode}
            onClick={() => switchMode(mode as 'Pomodoro' | 'Short Break' | 'Long Break')}
            className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all duration-1000 ease-out ${
              selectedMode === mode
                ? 'bg-white text-violet-600 shadow-sm transform scale-105'
                : 'text-violet-600/70 hover:text-violet-600 hover:bg-white/50'
            }`}
          >
            {mode}
          </button>
        ))}
      </div>

      {/* Timer Display */}
      <div className="relative w-64 h-64 mx-auto mb-8 transform transition-all duration-1000 hover:scale-105">
        {/* Background Circle */}
        <svg className="w-full h-full transform -rotate-90 transition-transform duration-1000">
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-violet-100"
          />
          <circle
            cx="128"
            cy="128"
            r="120"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-violet-500 transition-all duration-1000"
            strokeDasharray={`${(minutes * 60 + seconds) / (settings.pomodoro * 60) * 754} 754`}
            strokeLinecap="round"
            transform="rotate(-90 128 128)"
          />
        </svg>

        {/* Time Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-5xl font-bold text-gray-900 mb-2 transform transition-all duration-1000 hover:text-violet-600">
            {Math.floor(minutes)}:{(seconds).toString().padStart(2, '0')}
          </div>
          <div className="text-violet-600 font-medium transform transition-all duration-1000 hover:scale-105">{selectedMode}</div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={toggleTimer}
          className="px-8 py-3 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-all duration-1000 shadow-sm hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 group"
        >
          {isActive ? (
            <>
              <Pause size={20} className="transform transition-transform duration-1000 group-hover:scale-110" />
              <span className="transform transition-transform duration-1000 group-hover:translate-x-1">Pause</span>
            </>
          ) : (
            <>
              <Play size={20} className="transform transition-transform duration-1000 group-hover:scale-110" />
              <span className="transform transition-transform duration-1000 group-hover:translate-x-1">Start</span>
            </>
          )}
        </button>
        <button
          onClick={resetTimer}
          className="px-8 py-3 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-all duration-1000 shadow-sm hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2 group"
        >
          <RotateCcw size={20} className="transform transition-transform duration-1000 group-hover:rotate-180" />
          <span className="transform transition-transform duration-1000 group-hover:translate-x-1">Reset</span>
        </button>
      </div>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 opacity-0 animate-fade-in-super-slow">
          <div className="bg-white rounded-3xl p-8 w-[400px] shadow-xl transform transition-all duration-1000 animate-scale-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900 transform transition-all duration-1000 hover:text-violet-600">Timer Settings</h3>
              <button 
                onClick={() => setShowSettings(false)} 
                className="text-gray-500 hover:text-violet-600 transform transition-all duration-1000 hover:rotate-90"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 transform transition-all duration-1000 hover:text-violet-600">
                  Pomodoro Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.pomodoro}
                  onChange={(e) => updateSettings('pomodoro', Math.max(1, parseInt(e.target.value)))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-1000"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 transform transition-all duration-1000 hover:text-violet-600">
                  Short Break Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.shortBreak}
                  onChange={(e) => updateSettings('shortBreak', Math.max(1, parseInt(e.target.value)))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-1000"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 transform transition-all duration-1000 hover:text-violet-600">
                  Long Break Duration (minutes)
                </label>
                <input
                  type="number"
                  value={settings.longBreak}
                  onChange={(e) => updateSettings('longBreak', Math.max(1, parseInt(e.target.value)))}
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all duration-1000"
                  min="1"
                />
              </div>
            </div>
            
            <div className="mt-8 flex justify-end">
              <button
                onClick={saveSettings}
                className="px-6 py-2.5 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-all duration-1000 shadow-sm hover:shadow-xl transform hover:-translate-y-1"
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