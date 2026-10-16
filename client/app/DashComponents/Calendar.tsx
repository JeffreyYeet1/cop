"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Calendar as CalendarIcon, Plus, Users, ChevronLeft, ChevronRight, Sparkles, Trash2, X } from 'lucide-react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { focusStorageKey } from '../../lib/focusClock';

// Sample event data
interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  duration: number;
  color: string;
}

const getEventColor = (color: string) => {
  const colors = {
    blue: 'bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200',
    green: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200',
    purple: 'bg-purple-100 border-purple-300 text-purple-800 hover:bg-purple-200',
    orange: 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200',
  };
  return colors[color as keyof typeof colors] || colors.blue;
};

const getEventColorFromPriority = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'orange';
    case 'medium':
      return 'purple';
    case 'low':
      return 'green';
    default:
      return 'blue';
  }
};

const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

interface NewEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (event: Omit<CalendarEvent, 'id'>) => void;
}

const NewEventModal: React.FC<NewEventModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [time, setTime] = useState('09:00');
  const [duration, setDuration] = useState(30);
  const [color, setColor] = useState('blue');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!isOpen || !mounted) return null;

  const modalRoot = document.getElementById('modal-root');
  if (!modalRoot) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      title,
      time,
      duration,
      color
    });
    setTitle('');
    setTime('09:00');
    setDuration(30);
    setColor('blue');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center animate-fadeIn">
      <div 
        className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 w-full max-w-md shadow-xl transform transition-all duration-300 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900">Create New Event</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-300"
          >
            <X size={20} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-200"
              placeholder="Enter event title"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-200"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duration (min)
              </label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value))}
                min="15"
                step="15"
                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-200"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500/50 transition-all duration-200"
            >
              <option value="blue">Blue</option>
              <option value="green">Green</option>
              <option value="purple">Purple</option>
              <option value="orange">Orange</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-gray-600 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-500 text-white rounded-xl hover:bg-sky-600 transition-all duration-200"
            >
              Create Event
            </button>
          </div>
        </form>
      </div>
    </div>,
    modalRoot
  );
};

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [storageReady, setStorageReady] = useState(false);
  const [storageError, setStorageError] = useState('');
  const storageKey = useRef<string | null>(null);
  useEffect(() => {
    try {
      const account = focusStorageKey(localStorage.getItem('token'));
      const localDay = new Date().toLocaleDateString('en-CA');
      storageKey.current = account ? `${account.replace('focus', 'plan')}:${localDay}` : null;
      const saved = JSON.parse(localStorage.getItem(storageKey.current || '') || '[]');
      if (Array.isArray(saved)) setEvents(saved.filter(item => Number.isFinite(item.id) && typeof item.title === 'string' && /^\d{1,2}:\d{2}$/.test(item.time) && Number.isFinite(item.duration) && item.duration > 0 && item.duration <= 1440));
    } catch { setStorageError('Browser storage is unavailable. This day plan will not survive a refresh.'); }
    setStorageReady(true);
  }, []);
  useEffect(() => {
    if (storageReady && storageKey.current) {
      try { localStorage.setItem(storageKey.current, JSON.stringify(events)); }
      catch { setStorageError('Could not save the day plan on this browser.'); }
    }
  }, [events, storageReady]);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [showNewEventModal, setShowNewEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    time: '09:00',
    duration: 30,
    color: 'violet'
  });
  
  const today = new Date();
  const dayName = today.toLocaleString('default', { weekday: 'long' });
  const monthDay = today.toLocaleString('default', { month: 'long', day: 'numeric' });
  
  // Generate hours from 9 AM to 6 PM
  const hours = Array.from({ length: 10 }, (_, i) => {
    const hour = i + 9;
    return {
      label: hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`,
      value: hour * 60 // minutes since midnight
    };
  });

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id.toString());
    const dragImage = document.createElement('div');
    dragImage.className = 'p-2 bg-white rounded-lg shadow-md text-sm';
    dragImage.textContent = event.title;
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 0, 0);
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedEvent) return;
    
    const container = e.currentTarget as HTMLElement;
    const rect = container.getBoundingClientRect();
    
    // Calculate relative position in the container
    const relativeY = e.clientY - rect.top;
    const containerHeight = rect.height;
    
    // Calculate the percentage into the container
    const percentage = relativeY / containerHeight;
    const hourSegment = 60; // minutes in an hour segment
    
    // Get the hour segment this is dragged over
    const hourIndex = parseInt((e.currentTarget as HTMLElement).dataset.hourIndex || '0');
    const timeValue = hours[hourIndex].value;
    
    // Calculate minutes into the hour based on percentage
    const minutesIntoHour = Math.floor(percentage * hourSegment);
    
    // Round to nearest 15 minutes
    const roundedMinutes = Math.round(minutesIntoHour / 15) * 15;
    
    // Create new event time
    const newTimeInMinutes = timeValue + roundedMinutes;
    const newTime = minutesToTime(newTimeInMinutes);
    
    // Show a visual indicator
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    
    // Get the dropped data
    const jsonData = e.dataTransfer.getData('application/json');
    if (jsonData) {
      try {
        const droppedData = JSON.parse(jsonData);
        
        if (droppedData.type === 'task') {
          // Handle dropped task
          const taskData = droppedData.data;
          
          // Calculate time for new event
          const container = e.currentTarget as HTMLElement;
          const rect = container.getBoundingClientRect();
          const relativeY = e.clientY - rect.top;
          const containerHeight = rect.height;
          const percentage = relativeY / containerHeight;
          const hourSegment = 60;
          const hourIndex = parseInt((e.currentTarget as HTMLElement).dataset.hourIndex || '0');
          const timeValue = hours[hourIndex].value;
          const minutesIntoHour = Math.floor(percentage * hourSegment);
          const roundedMinutes = Math.round(minutesIntoHour / 15) * 15;
          const newTimeInMinutes = timeValue + roundedMinutes;
          const newTime = minutesToTime(newTimeInMinutes);

          // Create new event from task
          const newEvent: CalendarEvent = {
            id: Date.now(), // Generate unique ID
            title: taskData.title,
            time: newTime,
            duration: taskData.duration,
            color: getEventColorFromPriority(taskData.priority)
          };

          setEvents(prev => [...prev, newEvent]);
          return;
        }
      } catch (error) {
        console.error('Error parsing dropped data:', error);
      }
    }
    
    // Handle regular event drag and drop
    if (draggedEvent) {
      const container = e.currentTarget as HTMLElement;
      const rect = container.getBoundingClientRect();
      const relativeY = e.clientY - rect.top;
      const containerHeight = rect.height;
      const percentage = relativeY / containerHeight;
      const hourSegment = 60;
      const hourIndex = parseInt((e.currentTarget as HTMLElement).dataset.hourIndex || '0');
      const timeValue = hours[hourIndex].value;
      const minutesIntoHour = Math.floor(percentage * hourSegment);
      const roundedMinutes = Math.round(minutesIntoHour / 15) * 15;
      const newTimeInMinutes = timeValue + roundedMinutes;
      const newTime = minutesToTime(newTimeInMinutes);
      
      const updatedEvents = events.map(evt => 
        evt.id === draggedEvent.id 
          ? { ...evt, time: newTime } 
          : evt
      );
      
      setEvents(updatedEvents);
      setDraggedEvent(null);
    }
  };

  // Add delete handler
  const handleDeleteEvent = (eventId: number) => {
    setEvents(prev => prev.filter(event => event.id !== eventId));
  };

  const handleCreateEvent = () => {
    const newEventObj = {
      id: Math.max(0, ...events.map(event => event.id)) + 1,
      ...newEvent
    };
    setEvents([...events, newEventObj]);
    setShowNewEventModal(false);
    setNewEvent({ title: '', time: '09:00', duration: 30, color: 'violet' });
  };

  return (
    <>
      <div 
        className={`p-5 min-h-full rounded-2xl border border-stone-200 bg-white overflow-hidden animate-fadeIn relative ${
          showNewEventModal ? 'blur-sm' : ''
        } transition-all duration-300`}
      >
        {/* Header */}
        <div className="flex flex-wrap gap-4 justify-between items-center mb-6 animate-fadeIn relative" style={{animationDelay: "0.1s"}}>
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
              <h2 className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-all duration-300">Day plan</h2>
            </div>
            <p className="text-gray-500 ml-5">{dayName}, {monthDay}</p>
          </div>

          <div className="flex items-center space-x-3">
            <Link href="/calendar" className="text-xs text-stone-500 hover:text-violet-700">Google Calendar ↗</Link>
            <button 
              onClick={() => setShowNewEventModal(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full bg-white text-violet-600 border border-violet-200 hover:bg-violet-50 transition-all duration-300 transform hover:-translate-y-1"
            >
              <Plus size={14} className="mr-1" />
              New Event
            </button>
          </div>
        </div>

        {storageError && <p role="alert" className="text-xs text-red-700 mb-4">{storageError}</p>}
        <p className="text-[11px] text-stone-500 mb-5">{events.length ? `${events.length} time blocks for today` : 'Drop a task here, or add your first time block.'}</p>
        {/* Calendar Grid */}
        <div className="border-t border-gray-200 animate-fadeIn relative" style={{animationDelay: "0.3s"}}>
          {/* Render events first so they appear above the grid */}
          {events.map(event => {
            const eventStartMinutes = timeToMinutes(event.time);
            const eventEndMinutes = eventStartMinutes + event.duration;
            const firstHourValue = hours[0].value;
            const lastHourValue = hours[hours.length - 1].value + 60;
            const totalGridMinutes = lastHourValue - firstHourValue;
            
            // Calculate position and height relative to entire grid
            const topPosition = ((eventStartMinutes - firstHourValue) / totalGridMinutes) * 100;
            const height = (event.duration / totalGridMinutes) * 100;
            
            return (
              <div
                key={event.id}
                className={`absolute left-[80px] right-1 p-2 rounded-lg border cursor-move group transform hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${getEventColor(event.color)}`}
                style={{
                  top: `${topPosition}%`,
                  height: `${Math.max(height, 2)}%`,
                  zIndex: 2
                }}
                draggable
                onDragStart={(e) => handleDragStart(e, event)}
              >
                <div className="text-sm font-medium truncate">{event.title}</div>
                <div className="text-xs opacity-80">
                  {event.time} ({event.duration}min)
                </div>
                
                {/* Delete button */}
                <button
                  aria-label={`Delete ${event.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteEvent(event.id);
                  }}
                  className="absolute top-1 right-1 p-1 rounded-full opacity-60 group-hover:opacity-100 focus:opacity-100 hover:bg-red-100 transition-all duration-200 transform hover:scale-110"
                >
                  <Trash2 size={14} className="text-red-500" />
                </button>
              </div>
            );
          })}

          {/* Hour grid lines */}
          {hours.map((hour, index) => (
            <div 
              key={hour.label} 
              className="flex py-3 border-b border-gray-100 relative"
              style={{animationDelay: `${0.3 + index * 0.05}s`}}
              data-animate="fadeIn"
            >
              <div className="w-20 flex items-start justify-center pt-2">
                <span className="text-xs font-medium text-gray-500">{hour.label}</span>
              </div>
              
              <div 
                className="flex-1 min-h-[60px] relative transition-colors duration-200"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                data-hour-index={index}
              >
                {/* Hour Grid Line Highlight */}
                <div className="absolute left-0 right-0 top-0 h-full bg-gray-50 opacity-0 hover:opacity-30 transition-opacity duration-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Event Modal */}
      {showNewEventModal && createPortal(
        <>
          <div className="fixed inset-0 backdrop-blur-sm bg-black/20" style={{ zIndex: 99998 }} />
          <div className="fixed inset-0 flex items-center justify-center" style={{ zIndex: 99999 }}>
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-900">Create New Event</h2>
                <button 
                  onClick={() => setShowNewEventModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Title
                  </label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    placeholder="Enter event title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({...newEvent, time: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    value={newEvent.duration}
                    onChange={(e) => setNewEvent({...newEvent, duration: parseInt(e.target.value)})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                    min="15"
                    step="15"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <select
                    value={newEvent.color}
                    onChange={(e) => setNewEvent({...newEvent, color: e.target.value})}
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                  >
                    <option value="violet">Violet</option>
                    <option value="sky">Sky Blue</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCreateEvent}
                  className="px-6 py-2 bg-violet-500 text-white rounded-xl hover:bg-violet-600 transition-all duration-300"
                  disabled={!newEvent.title}
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </>,
        document.getElementById('modal-root') || document.body
      )}
    </>
  );
};

export default Calendar;