// app/DashComponents/FocusHistory.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { Clock, Calendar, AlertCircle } from 'lucide-react';

interface FocusSession {
  id: number;
  start_time: string;
  end_time: string | null;
  planned_duration: number;
  actual_duration: number | null;
  created_at: string;
}

const FocusHistory = () => {
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    return `${minutes} min`;
  };

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setError(null);
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You need to be logged in to view your focus history');
          setIsLoading(false);
          return;
        }

        const response = await fetch('/api/focus/sessions', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          if (response.status === 503) {
            throw new Error('Backend service unavailable');
          } else {
            throw new Error('Failed to fetch focus sessions');
          }
        }

        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Error fetching focus sessions:', error);
        setError(error instanceof Error ? error.message : 'Failed to load focus history');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSessions();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Focus History</h2>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-md p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">Focus History</h2>
        <div className="p-4 bg-red-50 text-red-700 rounded-lg flex items-center">
          <AlertCircle size={18} className="mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mt-8">
      <h2 className="text-xl font-semibold mb-4">Focus History</h2>
      
      {sessions.length === 0 ? (
        <p className="text-gray-500 text-center py-6">No focus sessions recorded yet.</p>
      ) : (
        <div className="space-y-4">
          {sessions.map(session => (
            <div key={session.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Calendar size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-700">{formatDate(session.start_time)}</span>
                </div>
                <div className="flex items-center">
                  <Clock size={16} className="text-gray-500 mr-2" />
                  <span className="text-gray-700">
                    {session.actual_duration 
                      ? formatDuration(session.actual_duration)
                      : formatDuration(session.planned_duration)}
                  </span>
                </div>
              </div>
              
              <div className="text-sm text-gray-500">
                <div>Started: {formatTime(session.start_time)}</div>
                {session.end_time && (
                  <div>Ended: {formatTime(session.end_time)}</div>
                )}
              </div>
              
              {session.actual_duration && session.planned_duration && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        session.actual_duration >= session.planned_duration 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (session.actual_duration / session.planned_duration) * 100)}%` 
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Planned: {formatDuration(session.planned_duration)}</span>
                    <span>Actual: {formatDuration(session.actual_duration)}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FocusHistory;