"use client";

import React, { useState } from 'react';
import { Calendar as CalendarIcon } from 'lucide-react';

interface Event {
  id: string;
  title: string;
  duration: string;
  color: string;
  time: string;
}

const TimeSlot = ({ 
  time, 
  event, 
  onDrop 
}: { 
  time: string; 
  event?: Event; 
  onDrop: (time: string, droppedEvent: Event) => void;
}) => {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('bg-gray-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-gray-50');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-gray-50');
    const droppedEvent = JSON.parse(e.dataTransfer.getData('text/plain'));
    onDrop(time, droppedEvent);
  };

  return (
    <div 
      className="flex items-start gap-2 py-2 relative group min-h-[60px] transition-colors"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <span className="text-sm text-gray-400 w-16">{time}</span>
      {event ? (
        <div 
          draggable
          className={`flex-1 p-3 rounded-lg text-white ${event.color} cursor-move`}
          style={{ minHeight: event.duration }}
          onDragStart={(e) => {
            e.dataTransfer.setData('text/plain', JSON.stringify(event));
          }}
        >
          <div className="font-medium">{event.title}</div>
          <div className="text-sm opacity-90">{event.duration}</div>
        </div>
      ) : (
        <div className="flex-1 border-t border-gray-100 mt-3"></div>
      )}
    </div>
  );
};

const Calendar = () => {
    const date = new Date();
  const dayName = date.toLocaleString('en-US', { weekday: 'long' });
  const monthDay = date.toLocaleString('en-US', { month: 'long', day: 'numeric' });
  const [events, setEvents] = useState<Event[]>([
    { id: '1', time: "7 AM", title: "Morning routine", duration: "30min", color: "bg-blue-400" },
    { id: '2', time: "10 AM", title: "Product demo with Jenn", duration: "1h", color: "bg-orange-400" },
    { id: '3', time: "11 AM", title: "Investigate secondary growth channels", duration: "1h", color: "bg-blue-400" },
    { id: '4', time: "12 PM", title: "Lunch", duration: "1h", color: "bg-blue-400" },
    { id: '5', time: "1 PM", title: "Review prototype of new feature", duration: "2h", color: "bg-purple-400" },
  ]);

  const handleEventDrop = (newTime: string, droppedEvent: Event) => {
    setEvents(events.map(e => 
      e.id === droppedEvent.id ? { ...e, time: newTime } : e
    ));
  };

  const timeSlots = Array.from({ length: 12 }, (_, i) => {
    const hour = i + 6; // Start from 6 AM
    const timeStr = `${hour > 12 ? hour - 12 : hour} ${hour >= 12 ? 'PM' : 'AM'}`;
    const event = events.find(e => e.time === timeStr);
    return { time: timeStr, event };
  });

  return (
    <div className="w-96 bg-white border-l h-screen overflow-y-auto">
      {/* Calendar Header */}
      <div className="p-4 border-b sticky top-0 bg-white z-10">
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm text-gray-600">
          <CalendarIcon size={16} />
          <span>Calendars</span>
        </button>
        <div className="mt-6">
          <div className="text-xl font-semibold">{dayName}</div>
          <div className="text-3xl font-bold">{monthDay}</div>
        </div>
      </div>

      {/* Time Slots */}
      <div className="p-4">
        {timeSlots.map((slot, index) => (
          <TimeSlot 
            key={index} 
            time={slot.time} 
            event={slot.event}
            onDrop={handleEventDrop}
          />
        ))}
      </div>
    </div>
  );
};

export default Calendar;