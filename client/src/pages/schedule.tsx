import { useState, useEffect } from "react";
import { MapPin, Clock, Calendar } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import Footer from "@/components/footer";

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  location?: string;
  color?: string;
}

export default function Schedule() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const CALENDAR_ID = "joshm.jazz@gmail.com";
        const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
            CALENDAR_ID
          )}/events?key=${API_KEY}&timeMin=${new Date().toISOString()}&singleEvents=true&orderBy=startTime&maxResults=50`
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Calendar API Response:", data);
          const filteredEvents =
            data.items?.filter((event: any) =>
              event.description?.includes("SHOW")
            ) || [];
          setEvents(filteredEvents);
        } else {
          const errorData = await response.json();
          console.error("Calendar API Error Response:", errorData);
        }
      } catch (error) {
        console.error("Schedule API Error:", error);
        console.log("Using offline mode for schedule");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const cleanLocation = (location?: string) => {
    if (!location) return "";
    return location.replace(/\\/g, "");
  };

  const getEventColor = (description?: string) => {
    if (!description) return "bg-purple-400";
    const upperDesc = description.toUpperCase();
    if (upperDesc.includes("RED")) return "bg-red-400";
    if (upperDesc.includes("GREEN")) return "bg-green-400";
    if (upperDesc.includes("YELLOW")) return "bg-yellow-400";
    if (upperDesc.includes("ORANGE")) return "bg-orange-400";
    if (upperDesc.includes("BLUE")) return "bg-blue-400";
    return "bg-purple-400";
  };

  const cleanDescription = (description?: string) => {
    if (!description) return "";
    let cleaned = description.replace(/SHOW/g, "").trim();
    cleaned = cleaned.replace(/\b(RED|GREEN|YELLOW|ORANGE|BLUE)\b/g, "").trim();
    cleaned = cleaned.replace(/\s+/g, " ").trim();
    return cleaned;
  };

  const renderDescriptionWithLinks = (description: string) => {
    const cleaned = cleanDescription(description);
    if (!cleaned) return null;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = cleaned.split(urlRegex);
    return parts.map((part, index) =>
      urlRegex.test(part) ? (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-600 hover:text-purple-800 underline break-all"
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  return (
    <>
      <section className="min-h-screen md:fit-screen bg-jazz-grey">
        <div className="container mx-auto px-4 py-8">
          <div
            className="text-center mb-8 opacity-0 translate-y-4 animate-in"
            style={{ animationDelay: "200ms" }}
          >
            <h1 className="text-5xl font-bold text-purple-500 mb-6">Schedule</h1>
            <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}

          {!loading && events.length === 0 && <div></div>}

          {!loading && events.length > 0 && (
            <div className="space-y-4 opacity-0 translate-y-4 animate-in" style={{ animationDelay: "400ms" }}>
              {events
                .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
                .map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventClick(event)}
                    className={`p-4 rounded-lg cursor-pointer hover:opacity-80 transition-opacity ${getEventColor(
                      event.description
                    )} text-white`}
                  >
                    <div className="font-semibold text-lg">{event.summary}</div>
                    <div className="text-sm">
                      {formatDate(event.start.dateTime)} | {formatTime(event.start.dateTime)}
                    </div>
                    {event.location && (
                      <div className="text-sm mt-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        {cleanLocation(event.location)}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}

          {/* Event Detail Modal */}
          <Dialog open={showEventModal} onOpenChange={setShowEventModal}>
            <DialogContent className="max-w-md bg-white">
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
                    <span>
                      {formatTime(selectedEvent.start.dateTime)} -{" "}
                      {formatTime(selectedEvent.end.dateTime)}
                    </span>
                  </div>
                  {selectedEvent.location && (
                    <div className="flex items-start text-gray-600">
                      <MapPin className="w-5 h-5 mr-3 text-purple-500 mt-0.5" />
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(
                          cleanLocation(selectedEvent.location)
                        )}`}
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
                      <p className="text-gray-700">{renderDescriptionWithLinks(selectedEvent.description)}</p>
                    </div>
                  )}
                </div>
              )}
            </DialogContent>
          </Dialog>
        </div>
      </section>

      {/* Mobile Footer */}
      <div className="md:hidden">
        <Footer />
      </div>
    </>
  );
}
