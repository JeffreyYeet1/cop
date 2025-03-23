"use client";
import React, { useEffect, useState } from 'react';

interface CalendarEvent {
  id: string;
  summary: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  description?: string;
}

interface Calendar {
  id: string;
  summary: string;
  description?: string;
  primary?: boolean;
}

export default function CalendarTest() {
  const [calendars, setCalendars] = useState<Calendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<string>("primary");
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch list of calendars
  const fetchCalendars = async () => {
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
      
      // Then use it to call Google's API
      const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch calendars: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Calendars:', data);
      setCalendars(data.items || []);
    } catch (err) {
      console.error('Error fetching calendars:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch calendars');
    } finally {
      setLoading(false);
    }
  };

  // Fetch events for selected calendar
  const fetchEvents = async (calendarId: string = 'primary') => {
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
      const oneMonthFromNow = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
      
      // Then use it to call Google's API directly
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?timeMin=${now.toISOString()}&timeMax=${oneMonthFromNow.toISOString()}`, {
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch events: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Events:', data);
      setEvents(data.items || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  // Create a new test event
  const createTestEvent = async () => {
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
      const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);

      const eventData = {
        summary: 'Test Event',
        description: 'This is a test event created from the calendar test page',
        start: {
          dateTime: now.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
        end: {
          dateTime: oneHourFromNow.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      // Then use it to call Google's API directly
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${selectedCalendar}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });

      if (!response.ok) {
        throw new Error(`Failed to create event: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Created event:', data);
      
      // Refresh events list
      await fetchEvents(selectedCalendar);
    } catch (err) {
      console.error('Error creating event:', err);
      setError(err instanceof Error ? err.message : 'Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  // Delete an event
  const deleteEvent = async (eventId: string) => {
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

      // Then use it to call Google's API directly
      const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/${selectedCalendar}/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${access_token}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to delete event: ${response.statusText}`);
      }

      // Refresh events list
      await fetchEvents(selectedCalendar);
    } catch (err) {
      console.error('Error deleting event:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  // Load calendars on component mount
  useEffect(() => {
    fetchCalendars();
  }, []);

  // Load events when selected calendar changes
  useEffect(() => {
    if (selectedCalendar) {
      fetchEvents(selectedCalendar);
    }
  }, [selectedCalendar]);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Calendar Test Page</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Calendars Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Your Calendars</h2>
        <select 
          value={selectedCalendar}
          onChange={(e) => setSelectedCalendar(e.target.value)}
          className="border rounded p-2 mb-4"
        >
          <option value="primary">Primary Calendar</option>
          {calendars.map(calendar => (
            <option key={calendar.id} value={calendar.id}>
              {calendar.summary}
            </option>
          ))}
        </select>
      </div>

      {/* Create Event Button */}
      <button
        onClick={createTestEvent}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded mb-6 hover:bg-blue-600 disabled:bg-blue-300"
      >
        Create Test Event
      </button>

      {/* Events Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Events (Next 30 Days)</h2>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="space-y-4">
            {events.map(event => (
              <div key={event.id} className="border rounded p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{event.summary}</h3>
                    <p className="text-sm text-gray-600">
                      {new Date(event.start.dateTime).toLocaleString()} - {new Date(event.end.dateTime).toLocaleString()}
                    </p>
                    {event.description && (
                      <p className="text-sm mt-2">{event.description}</p>
                    )}
                  </div>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
            {events.length === 0 && (
              <p>No events found for the selected period.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 