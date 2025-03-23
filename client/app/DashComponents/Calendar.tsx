"use client";

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Users, ChevronRight, Sparkles } from 'lucide-react';

interface CalendarEvent {
  id: string;
  title: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  description?: string;
  color?: string;
  location?: string;
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
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const dayName = selectedDate.toLocaleString('default', { weekday: 'long' });
  const monthDay = selectedDate.toLocaleString('default', { month: 'long', day: 'numeric' });
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  
  // Generate hours from 7 AM to 8 PM (14 hours)
  const hours = Array.from({ length: 14 }, (_, i) => {
    const hour = i + 7;
    return {
      label: hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`,
      value: hour * 60 // minutes since midnight
    };
  });

  // Toggle between today and tomorrow
  const toggleDay = () => {
    const newDate = new Date(selectedDate);
    if (isToday) {
      newDate.setDate(newDate.getDate() + 1);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  // Fetch events from Google Calendar
  const fetchEvents = async () => {
    try {
      setLoading(true);
      // First get the Google OAuth token
      const tokenResponse = await fetch('http://localhost:8000/api/auth/token', {
        credentials: 'include',
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get Google token');
      }
      
      const { access_token } = await tokenResponse.json();
      
      const now = new Date();
      now.setHours(0, 0, 0, 0); // Start of today
      
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(23, 59, 59, 999); // End of tomorrow
      
      // Then use it to call Google's API directly for the primary calendar
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${now.toISOString()}&timeMax=${tomorrow.toISOString()}&orderBy=startTime&singleEvents=true`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform Google Calendar events to our format and filter for selected date
      const transformedEvents = data.items
        .map((item: any) => ({
          id: item.id,
          title: item.summary,
          start: item.start,
          end: item.end,
          description: item.description,
          location: item.location,
          color: 'blue' // You can map calendar colors here if needed
        }))
        .filter((event: CalendarEvent) => {
          const eventDate = new Date(event.start.dateTime);
          return eventDate.toDateString() === selectedDate.toDateString();
        });

      setEvents(transformedEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]); // Refetch when selected date changes

  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    setDraggedEvent(event);
    e.dataTransfer.setData('text/plain', event.id);
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
    if (!draggedEvent && !e.dataTransfer.types.includes('application/json+task')) return;
    e.currentTarget.classList.add('bg-blue-50');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('bg-blue-50');
  };

  const createEventFromTask = async (task: any, eventDate: Date) => {
    try {
      const tokenResponse = await fetch('http://localhost:8000/api/auth/token', {
        credentials: 'include',
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get Google token');
      }
      
      const { access_token } = await tokenResponse.json();

      // Create a new event from the task
      const newEvent = {
        summary: task.title,
        description: task.description,
        start: {
          dateTime: eventDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(eventDate.getTime() + (task.estimated_duration || 60) * 60 * 1000).toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      };

      const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent)
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      // Refresh events
      await fetchEvents();
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('bg-blue-50');
    
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

    // Check if this is a task being dropped
    const taskData = e.dataTransfer.getData('application/json+task');
    if (taskData) {
      const task = JSON.parse(taskData);
      const eventDate = new Date(selectedDate);
      const [hours, minutes] = newTime.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);
      await createEventFromTask(task, eventDate);
      return;
    }
    
    // Handle existing event drag and drop
    if (!draggedEvent) return;
    
    try {
      // Get the token
      const tokenResponse = await fetch('http://localhost:8000/api/auth/token', {
        credentials: 'include',
      });
      
      if (!tokenResponse.ok) {
        throw new Error('Failed to get Google token');
      }
      
      const { access_token } = await tokenResponse.json();

      // Update the event in Google Calendar
      const eventDate = new Date();
      const [hours, minutes] = newTime.split(':').map(Number);
      eventDate.setHours(hours, minutes, 0, 0);

      const updatedEvent = {
        id: draggedEvent.id,
        summary: draggedEvent.title,  // Google Calendar uses 'summary' for the title
        description: draggedEvent.description,
        location: draggedEvent.location,  // Preserve the location
        start: {
          dateTime: eventDate.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: new Date(eventDate.getTime() + 60 * 60 * 1000).toISOString(), // Add 1 hour
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        }
      };

      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events/${draggedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent)
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      // Refresh events
      await fetchEvents();
    } catch (err) {
      console.error('Error updating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to update event');
    }
    
    setDraggedEvent(null);
  };

  return (
    <div className="p-5 min-h-full bg-white overflow-hidden animate-fadeIn">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 animate-fadeIn" style={{animationDelay: "0.1s"}}>
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-pulse"></div>
            <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-all duration-300">Calendar</h2>
          </div>
          <p className="text-gray-500 ml-5">{dayName}, {monthDay}</p>
        </div>

        <div className="flex items-center space-x-3">
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full bg-purple-50 text-purple-600 border border-purple-100 hover:bg-purple-100 transition-all duration-300 transform hover:-translate-y-1">
            <Users size={14} className="mr-1" />
            Calendars
          </button>
          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium rounded-full bg-white text-purple-600 border border-purple-200 hover:bg-purple-50 transition-all duration-300 transform hover:-translate-y-1">
            <Plus size={14} className="mr-1" />
            New Event
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center mb-6 animate-fadeIn" style={{animationDelay: "0.2s"}}>
        <button 
          onClick={toggleDay}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-all duration-200 flex items-center space-x-1"
        >
          <ChevronRight 
            size={16} 
            className={`text-gray-500 transform transition-transform duration-200 ${isToday ? '' : 'rotate-180'}`} 
          />
          <span className="text-sm text-gray-500">
            {isToday ? "View Tomorrow" : "Back to Today"}
          </span>
        </button>
        <div className="flex items-center text-sm text-gray-500">
          <Sparkles size={14} className="mr-1.5 text-purple-500" />
          {isToday ? "Today's Schedule" : "Tomorrow's Schedule"}
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Calendar Grid */}
      <div className="border-t border-gray-200 animate-fadeIn" style={{animationDelay: "0.3s"}}>
        {loading ? (
          <div className="py-4 text-center text-gray-500">Loading events...</div>
        ) : (
          hours.map((hour, index) => (
            <div 
              key={hour.label} 
              className="flex py-1.5 border-b border-gray-100 relative"
              style={{animationDelay: `${0.3 + index * 0.05}s`}}
              data-animate="fadeIn"
            >
              <div className="w-20 flex items-start justify-center pt-1">
                <span className="text-xs font-medium text-gray-500">{hour.label}</span>
              </div>
              
              <div 
                className="flex-1 min-h-[40px] relative transition-colors duration-200"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                data-hour-index={index}
              >
                {events
                  .filter(event => {
                    const eventStart = new Date(event.start.dateTime);
                    const eventHour = eventStart.getHours();
                    const hourStart = Math.floor(hour.value / 60);
                    return eventHour === hourStart;
                  })
                  .map(event => {
                    const eventStart = new Date(event.start.dateTime);
                    const eventEnd = new Date(event.end.dateTime);
                    const minutesIntoHour = eventStart.getMinutes();
                    const durationMinutes = (eventEnd.getTime() - eventStart.getTime()) / (1000 * 60);
                    const topPosition = (minutesIntoHour / 60) * 100;
                    const height = (durationMinutes / 60) * 100;
                    
                    return (
                      <div
                        key={event.id}
                        className={`absolute left-1 right-1 p-1 rounded-lg border cursor-move transform hover:-translate-y-1 hover:shadow-md transition-all duration-300 ${getEventColor(event.color || 'blue')}`}
                        style={{
                          top: `${topPosition}%`,
                          height: `${Math.max(height, 25)}%`,
                          maxHeight: '95%'
                        }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, event)}
                      >
                        <div className="text-xs font-medium truncate">
                          {event.title}
                          {event.location && <span className="opacity-75"> | {event.location}</span>}
                        </div>
                        <div className="text-[10px] opacity-80">
                          {eventStart.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {eventEnd.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    );
                  })}
                  
                {/* Hour Grid Line Highlight */}
                <div className="absolute left-0 right-0 top-0 h-full bg-gray-50 opacity-0 hover:opacity-30 transition-opacity duration-200 pointer-events-none"></div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Calendar;