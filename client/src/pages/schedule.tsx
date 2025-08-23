import { useState, useEffect } from "react";
import { MapPin, Clock, Calendar, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

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



  const cleanLocation = (location?: string) => {
    if (!location) return '';
    return location.replace(/\\/g, '');
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const getEventsForDay = (day: number) => {
    const dayDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    return events.filter(event => {
      const eventDate = new Date(event.start.dateTime);
      return eventDate.toDateString() === dayDate.toDateString();
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getEventColor = (description?: string) => {
    if (!description) return 'bg-purple-400';
    
    const upperDesc = description.toUpperCase();
    if (upperDesc.includes('RED')) return 'bg-red-400';
    if (upperDesc.includes('GREEN')) return 'bg-green-400';
    if (upperDesc.includes('YELLOW')) return 'bg-yellow-400';
    if (upperDesc.includes('ORANGE')) return 'bg-orange-400';
    if (upperDesc.includes('BLUE')) return 'bg-blue-400';
    
    return 'bg-purple-400';
  };

  const cleanDescription = (description?: string) => {
    if (!description) return '';
    
    let cleaned = description.replace(/SHOW/g, '').trim();
    cleaned = cleaned.replace(/\b(RED|GREEN|YELLOW|ORANGE|BLUE)\b/g, '').trim();
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    
    return cleaned;
  };

  return (
    <section className="min-h-screen md:h-full bg-jazz-grey md:overflow-y-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: '200ms' }}>
          <h1 className="text-5xl font-bold text-purple-500 mb-6">Schedule</h1>
          <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
          </div>
        )}

        {!loading && events.length === 0 && (
          // Don't show placeholder - just empty space when no events
          <div></div>
        )}

        {!loading && (
          <div className="opacity-0 translate-y-4 animate-in" style={{ animationDelay: '400ms' }}>
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button 
                onClick={goToPreviousMonth}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft className="w-6 h-6 text-gray-600" />
              </button>
              
              <h2 
                className="text-2xl font-bold text-purple-500 cursor-pointer text-center flex-1"
                onDoubleClick={goToCurrentMonth}
              >
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button 
                onClick={goToNextMonth}
                className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <ChevronRight className="w-6 h-6 text-gray-600" />
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Day Headers */}
              <div className="grid grid-cols-7 bg-gray-100">
                {dayNames.map(day => (
                  <div key={day} className="p-4 text-center font-semibold text-gray-700">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7">
                {getDaysInMonth(currentDate).map((day, index) => {
                  const dayEvents = day ? getEventsForDay(day) : [];
                  
                  return (
                    <div 
                      key={index} 
                      className={`min-h-[120px] p-2 border-r border-b border-gray-200 ${
                        day ? 'bg-white hover:bg-gray-50' : 'bg-gray-50'
                      }`}
                    >
                      {day && (
                        <>
                          <div className="font-semibold text-gray-800 mb-2">{day}</div>
                          <div className="space-y-1">
                            {dayEvents.map(event => (
                              <div
                                key={event.id}
                                onClick={() => handleEventClick(event)}
                                className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(event.description)} text-white`}
                              >
                                <div className="truncate font-medium">{event.summary}</div>
                                <div className="truncate">{formatTime(event.start.dateTime)}</div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Event Detail Modal */}
        <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
          <DialogContent className="max-w-md">
            <DialogTitle className="text-xl font-bold text-gray-800 mb-4">
              {selectedEvent?.summary}
            </DialogTitle>
            
            {selectedEvent && (
              <div className="space-y-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-3 text-purple-500" />
                  <span>{formatDate(selectedEvent.start.dateTime)}</span>
                </div>
                
                <div className="flex items-center text-gray-600">
                  <Clock className="w-5 h-5 mr-3 text-purple-500" />
                  <span>{formatTime(selectedEvent.start.dateTime)} - {formatTime(selectedEvent.end.dateTime)}</span>
                </div>
                
                {selectedEvent.location && (
                  <div className="flex items-start text-gray-600">
                    <MapPin className="w-5 h-5 mr-3 text-purple-500 mt-0.5" />
                    <a 
                      href={`https://maps.google.com/?q=${encodeURIComponent(cleanLocation(selectedEvent.location))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 underline"
                    >
                      {cleanLocation(selectedEvent.location)}
                    </a>
                  </div>
                )}
                
                {selectedEvent.description && cleanDescription(selectedEvent.description) && (
                  <div className="mt-4 p-3 bg-gray-50 rounded">
                    <p className="text-gray-700">{cleanDescription(selectedEvent.description)}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}