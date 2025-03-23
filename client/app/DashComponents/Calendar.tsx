"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon, Plus, Users, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

// Sample event data
interface CalendarEvent {
  id: number;
  title: string;
  time: string;
  duration: number;
  color: string;
}

const initialEvents: CalendarEvent[] = [
  { id: 1, title: 'Product Meeting', time: '9:00', duration: 60, color: 'blue' },
  { id: 2, title: 'Lunch with Team', time: '12:30', duration: 90, color: 'green' },
  { id: 3, title: 'Design Review', time: '15:00', duration: 45, color: 'purple' },
  { id: 4, title: 'Client Call', time: '17:00', duration: 30, color: 'orange' }
];

const getEventColor = (color: string) => {
  const colors = {
    blue: 'bg-violet-100 border-violet-300 text-violet-800 hover:bg-violet-200',
    green: 'bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200',
    purple: 'bg-fuchsia-100 border-fuchsia-300 text-fuchsia-800 hover:bg-fuchsia-200',
    orange: 'bg-amber-100 border-amber-300 text-amber-800 hover:bg-amber-200',
  };
  return colors[color as keyof typeof colors] || colors.blue;
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

const Calendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>(initialEvents);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  
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
    e.currentTarget.classList.add('bg-violet-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-violet-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-violet-50');
    
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
    
    // Update the event time
    const updatedEvents = events.map(evt => 
      evt.id === draggedEvent.id 
        ? { ...evt, time: newTime } 
        : evt
    );
    
    setEvents(updatedEvents);
    setDraggedEvent(null);
  };

  return (
    <div className="p-5 min-h-full bg-white overflow-hidden animate-fadeIn relative z-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 animate-fadeIn" style={{animationDelay: "0.1s"}}>
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-violet-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-violet-600 transition-all duration-300">Calendar</h2>
          </div>
          <p className="text-gray-500 ml-5">{dayName}, {monthDay}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full bg-violet-50 text-violet-600 border border-violet-100 hover:bg-violet-100 transition-all duration-300 transform hover:-translate-y-1">
            <Users size={14} className="mr-1" />
            Calendars
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full bg-white text-violet-600 border border-violet-200 hover:bg-violet-50 transition-all duration-300 transform hover:-translate-y-1">
            <Plus size={14} className="mr-1" />
            New Event
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-6 animate-fadeIn" style={{animationDelay: "0.2s"}}>
        <div className="flex space-x-1">
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200">
            <ChevronLeft size={16} className="text-gray-500" />
          </button>
          <button className="p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200">
            <ChevronRight size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="flex items-center text-sm text-gray-500">
          <Sparkles size={14} className="mr-1.5 text-violet-500" />
          Today's Schedule
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="border-t border-gray-200 animate-fadeIn" style={{animationDelay: "0.3s"}}>
        {hours.map((hour, index) => (
          <div 
            key={hour.label} 
            className="flex py-3 border-b border-gray-100 relative group"
            style={{animationDelay: `${0.3 + index * 0.05}s`}}
            data-animate="fadeIn"
          >
            <div className="w-20 flex items-start justify-center pt-2">
              <span className="text-xs font-medium text-gray-500">{hour.label}</span>
            </div>
            
            <div 
              className="flex-1 min-h-[60px] relative transition-colors duration-200 group-hover:bg-violet-50/30"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              data-hour-index={index}
            >
              {events
                .filter(event => {
                  const eventMinutes = timeToMinutes(event.time);
                  const hourStart = hour.value;
                  const hourEnd = hourStart + 60;
                  return eventMinutes >= hourStart && eventMinutes < hourEnd;
                })
                .map(event => {
                  const eventMinutes = timeToMinutes(event.time);
                  const hourStart = hour.value;
                  const topPosition = ((eventMinutes - hourStart) / 60) * 100;
                  const height = (event.duration / 60) * 100;
                  
                  return (
                    <div
                      key={event.id}
                      className={`absolute left-1 right-1 p-2 rounded-lg border cursor-move transform hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${getEventColor(event.color)}`}
                      style={{
                        top: `${topPosition}%`,
                        height: `${Math.max(height, 30)}%`,
                        maxHeight: '95%'
                      }}
                      draggable
                      onDragStart={(e) => handleDragStart(e, event)}
                    >
                      <div className="text-sm font-medium truncate">{event.title}</div>
                      <div className="text-xs opacity-80">{event.time}</div>
                    </div>
                  );
                })}
                
              {/* Hour Grid Line Highlight */}
              <div className="absolute left-0 right-0 top-0 h-full bg-gray-50 opacity-0 hover:opacity-30 transition-opacity duration-200 pointer-events-none"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Calendar;