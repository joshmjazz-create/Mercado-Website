import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Ticket, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { Event } from "@shared/schema";

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
    staleTime: 0, // Always treat data as stale
    gcTime: 0, // Don't cache data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  };

  const getLastDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0);
  };

  const getDaysInMonth = (date: Date) => {
    return getLastDayOfMonth(date).getDate();
  };

  const getStartingDayOfWeek = (date: Date) => {
    return getFirstDayOfMonth(date).getDay();
  };

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toDateString();
    return events.filter(event => {
      const eventDate = new Date(event.startTime);
      return eventDate.toDateString() === dateStr;
    });
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToCurrentMonth = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  const isCurrentMonth = () => {
    const now = new Date();
    return currentDate.getMonth() === now.getMonth() && currentDate.getFullYear() === now.getFullYear();
  };

  const handleMonthHeaderDoubleClick = () => {
    if (!isCurrentMonth()) {
      goToCurrentMonth();
    }
  };

  const openEventDialog = (event: Event) => {
    setSelectedEvent(event);
    setIsEventDialogOpen(true);
  };

  const formatEventTime = (startTime: Date, endTime: Date) => {
    const start = startTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    const end = endTime.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    return `${start} - ${end}`;
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const startingDay = getStartingDayOfWeek(currentDate);
    const days = [];

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-24 p-1 border border-gray-200"></div>
      );
    }

    // Add cells for each day of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();

      days.push(
        <div 
          key={day}
          className={`h-24 p-1 border border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
            isToday ? 'bg-purple-50 border-purple-200' : ''
          }`}
        >
          <div className={`font-semibold text-sm mb-1 ${isToday ? 'text-purple-800' : 'text-gray-700'}`}>
            {day}
          </div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event) => {
              // Color mapping for different calendar colors - you can customize these
              const getEventColor = (color: string) => {
                const colorMap = {
                  'purple': 'bg-purple-100 text-purple-800 hover:bg-purple-200',
                  'red': 'bg-red-100 text-red-800 hover:bg-red-200',
                  'orange': 'bg-orange-100 text-orange-800 hover:bg-orange-200', 
                  'yellow': 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
                  'green': 'bg-green-100 text-green-800 hover:bg-green-200',
                  'blue': 'bg-blue-100 text-blue-800 hover:bg-blue-200',
                  'indigo': 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
                  'pink': 'bg-pink-100 text-pink-800 hover:bg-pink-200',
                  'teal': 'bg-teal-100 text-teal-800 hover:bg-teal-200',
                  'cyan': 'bg-cyan-100 text-cyan-800 hover:bg-cyan-200',
                };
                return colorMap[color as keyof typeof colorMap] || colorMap.purple;
              };
              
              return (
                <div
                  key={event.id}
                  onClick={() => openEventDialog(event)}
                  className={`text-xs p-1 rounded truncate transition-colors cursor-pointer ${getEventColor(event.color || 'default')}`}
                >
                  {event.title}
                </div>
              );
            })}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 pl-1">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">Schedule</h2>
            <p className="text-xl text-gray-600 mb-8">Catch Joshua live at these upcoming performances</p>
            <div className="w-24 h-1 bg-purple-600 mx-auto"></div>
          </div>
          
          <div className="bg-white rounded-lg shadow-lg p-6">
            <Skeleton className="h-96 w-full rounded-lg" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">Schedule</h2>
          <p className="text-xl text-gray-600 mb-8">Click on any date to view event details</p>
          <div className="w-24 h-1 bg-purple-600 mx-auto"></div>
        </div>
        
        {/* Calendar Header */}
        <Card className="shadow-lg mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="outline"
                onClick={() => navigateMonth('prev')}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <h3 
                className={`text-2xl font-bold text-purple-800 cursor-pointer transition-colors ${
                  !isCurrentMonth() ? 'hover:text-purple-600' : ''
                }`}
                onDoubleClick={handleMonthHeaderDoubleClick}
                title={!isCurrentMonth() ? 'Double-click to return to current month' : 'Current month'}
              >
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              
              <Button
                variant="outline"
                onClick={() => navigateMonth('next')}
                className="flex items-center gap-2"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
            
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
              {/* Day Headers */}
              {dayNames.map(day => (
                <div key={day} className="p-3 bg-purple-100 text-purple-800 font-semibold text-center border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
              
              {/* Calendar Days */}
              {renderCalendar()}
            </div>
          </CardContent>
        </Card>
        
        <div className="text-center">
          <p className="text-gray-600">Schedule automatically synced with Google Calendar</p>
        </div>
      </div>
      
      {/* Event Details Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-purple-800">{selectedEvent?.title}</DialogTitle>
            <DialogDescription>
              Event details and booking information
            </DialogDescription>
          </DialogHeader>
          
          {selectedEvent && (
            <div className="space-y-4">
              {selectedEvent.description && (
                <p className="text-gray-600">{selectedEvent.description}</p>
              )}
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-4 h-4 text-purple-600" />
                  <span>{formatEventTime(new Date(selectedEvent.startTime), new Date(selectedEvent.endTime))}</span>
                </div>
                
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4 text-purple-600" />
                  {selectedEvent.address ? (
                    <a 
                      href={`https://maps.google.com/maps?q=${encodeURIComponent(selectedEvent.address)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                    >
                      {selectedEvent.venue || 'Venue TBD'}
                    </a>
                  ) : (
                    <span>{selectedEvent.venue || 'Venue TBD'}</span>
                  )}
                </div>
                
                {selectedEvent.ticketPrice && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Ticket className="w-4 h-4 text-purple-600" />
                    <span>{selectedEvent.ticketPrice}</span>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2 pt-4">
                {selectedEvent.ticketUrl && (
                  <Button 
                    asChild
                    className="bg-purple-600 hover:bg-purple-700 text-white font-semibold flex-1"
                  >
                    <a href={selectedEvent.ticketUrl} target="_blank" rel="noopener noreferrer">
                      <Ticket className="w-4 h-4 mr-2" />
                      Get Tickets
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
