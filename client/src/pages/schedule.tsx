import { useState, useEffect } from "react";
import { MapPin, Clock, Calendar } from "lucide-react";

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone?: string;
  };
  end: {
    dateTime: string;
    timeZone?: string;
  };
  location?: string;
  color?: string;
}

export default function Schedule() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const CALENDAR_ID = 'joshm.jazz@gmail.com';
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(CALENDAR_ID)}/events?key=${import.meta.env.VITE_GOOGLE_API_KEY}&timeMin=${new Date().toISOString()}&singleEvents=true&orderBy=startTime&maxResults=50`
        );
        
        if (response.ok) {
          const data = await response.json();
          const filteredEvents = data.items?.filter((event: any) => 
            event.description?.includes('SHOW')
          ) || [];
          setEvents(filteredEvents);
        }
      } catch (error) {
        console.log('Using offline mode for schedule');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getCleanDescription = (description: string = '') => {
    return description
      .replace(/\bSHOW\b/g, '')
      .replace(/\b(RED|BLUE|GREEN|YELLOW|PURPLE|ORANGE|PINK|BLACK|WHITE)\b/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };

  const getEventColor = (description: string = '') => {
    const colorMap: Record<string, string> = {
      'RED': 'border-red-500 bg-red-500',
      'BLUE': 'border-blue-500 bg-blue-500',
      'GREEN': 'border-green-500 bg-green-500',
      'YELLOW': 'border-yellow-500 bg-yellow-500',
      'PURPLE': 'border-purple-500 bg-purple-500',
      'ORANGE': 'border-orange-500 bg-orange-500',
      'PINK': 'border-pink-500 bg-pink-500',
      'BLACK': 'border-gray-800 bg-gray-800',
      'WHITE': 'border-gray-200 bg-gray-200',
    };

    for (const [color, classes] of Object.entries(colorMap)) {
      if (description.toUpperCase().includes(color)) {
        return classes;
      }
    }
    
    return 'border-purple-500 bg-purple-500';
  };

  return (
    <section className="min-h-screen md:h-full bg-jazz-cream md:overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-400 mb-6">Schedule</h1>
          <div className="w-24 h-1 bg-purple-400 mx-auto"></div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-400"></div>
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-20 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
            <div className="bg-gray-100 rounded-lg p-8 max-w-md mx-auto">
              <Calendar className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h3 className="text-xl text-gray-800 mb-4">No Upcoming Shows</h3>
              <p className="text-gray-600">
                Check back soon for upcoming performance dates and venues.
              </p>
            </div>
          </div>
        )}

        {!loading && events.length > 0 && (
          <div className="max-w-4xl mx-auto opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
            <div className="space-y-6">
              {events.map((event, index) => (
                <div
                  key={event.id}
                  className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-6 border-l-4 transform transition-all duration-300 hover:scale-105 opacity-0 translate-y-4 animate-in"
                  style={{ 
                    animationDelay: `${600 + (index * 100)}ms`,
                    borderLeftColor: getEventColor(event.description).split(' ')[0].replace('border-', '')
                  }}
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white mb-2">{event.summary}</h3>
                      
                      {event.description && getCleanDescription(event.description) && (
                        <p className="text-gray-300 mb-3">
                          {getCleanDescription(event.description)}
                        </p>
                      )}

                      <div className="flex flex-col sm:flex-row gap-4 text-sm text-gray-400">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-purple-400" />
                          {formatDate(event.start.dateTime)}
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-purple-400" />
                          {formatTime(event.start.dateTime)} - {formatTime(event.end.dateTime)}
                        </div>
                      </div>

                      {event.location && (
                        <div className="flex items-center mt-2 text-sm text-gray-400">
                          <MapPin className="w-4 h-4 mr-2 text-purple-400" />
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(event.location.replace(/\\/g, ''))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="hover:text-purple-400 transition-colors duration-200 underline"
                          >
                            {event.location.replace(/\\/g, '')}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}