import { useQuery } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Ticket, CalendarPlus, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { Event } from "@shared/schema";

export default function Schedule() {
  const { data: events = [], isLoading } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">Upcoming Shows</h2>
            <p className="text-xl text-gray-600 mb-8">Catch Joshua live at these upcoming performances</p>
            <div className="w-24 h-1 bg-jazz-blue mx-auto"></div>
          </div>
          
          <div className="space-y-6">
            {Array.from({ length: 3 }, (_, i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  const formatEventDate = (date: Date) => {
    const month = date.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate();
    return { month, day };
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

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-purple-800 mb-4">Upcoming Shows</h2>
          <p className="text-xl text-gray-600 mb-8">Catch Joshua live at these upcoming performances</p>
          <div className="w-24 h-1 bg-jazz-blue mx-auto"></div>
        </div>
        
        <div className="space-y-6">
          {events.length === 0 ? (
            <Card className="shadow-lg">
              <CardContent className="text-center py-16">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Upcoming Events</h3>
                <p className="text-gray-500">Events from Google Calendar will appear here once connected.</p>
              </CardContent>
            </Card>
          ) : (
            events.map((event) => {
              const { month, day } = formatEventDate(new Date(event.startTime));
              const timeRange = formatEventTime(new Date(event.startTime), new Date(event.endTime));
              
              return (
                <Card key={event.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="bg-jazz-blue text-white p-3 rounded-lg text-center min-w-[80px]">
                            <div className="text-sm font-semibold">{month}</div>
                            <div className="text-2xl font-bold">{day}</div>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-purple-800 mb-2">{event.title}</h3>
                            {event.description && (
                              <p className="text-gray-600 mb-2">{event.description}</p>
                            )}
                            <div className="space-y-1 text-gray-600">
                              <p className="flex items-center gap-2">
                                <Clock className="text-jazz-green w-4 h-4" />
                                <span>{timeRange}</span>
                              </p>
                              <p className="flex items-center gap-2">
                                <MapPin className="text-jazz-green w-4 h-4" />
                                <span>{event.venue}</span>
                              </p>
                              {event.ticketPrice && (
                                <p className="flex items-center gap-2">
                                  <Ticket className="text-jazz-green w-4 h-4" />
                                  <span>{event.ticketPrice}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2">
                        {event.ticketUrl && (
                          <Button 
                            asChild
                            className="bg-jazz-blue hover:bg-jazz-blue-light text-white font-semibold"
                          >
                            <a href={event.ticketUrl} target="_blank" rel="noopener noreferrer">
                              <Ticket className="w-4 h-4 mr-2" />
                              Get Tickets
                            </a>
                          </Button>
                        )}
                        <Button 
                          variant="outline" 
                          className="border-jazz-green hover:bg-jazz-green hover:text-white text-jazz-green font-semibold"
                        >
                          <CalendarPlus className="w-4 h-4 mr-2" />
                          Add to Calendar
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        
        <div className="text-center mt-12">
          <p className="text-gray-600">Schedule automatically synced with Google Calendar</p>
        </div>
      </div>
    </section>
  );
}
