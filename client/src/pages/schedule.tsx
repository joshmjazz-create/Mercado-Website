import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

interface CalendarEvent {
  id: string;
  summary: string;
  description?: string;
  start: { dateTime?: string; date?: string };
  end: { dateTime?: string; date?: string };
  location?: string;
}

export default function Schedule() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${import.meta.env.VITE_GOOGLE_CALENDAR_ID}/events?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
        );
        const data = await response.json();

        if (data.items) {
          const now = new Date();

          const filteredEvents = data.items.filter((event: CalendarEvent) => {
            const hasSHOW =
              event.description &&
              event.description.includes("SHOW");

            const startDate = event.start.dateTime
              ? new Date(event.start.dateTime)
              : event.start.date
              ? new Date(event.start.date)
              : null;

            return hasSHOW && startDate && startDate >= now;
          });

          // sort events chronologically
          filteredEvents.sort((a: CalendarEvent, b: CalendarEvent) => {
            const aDate = a.start.dateTime
              ? new Date(a.start.dateTime).getTime()
              : a.start.date
              ? new Date(a.start.date).getTime()
              : 0;
            const bDate = b.start.dateTime
              ? new Date(b.start.dateTime).getTime()
              : b.start.date
              ? new Date(b.start.date).getTime()
              : 0;
            return aDate - bDate;
          });

          setEvents(filteredEvents);
        }
      } catch (err) {
        console.error("Error fetching calendar events:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  function formatDate(dateString?: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  function formatTime(dateString?: string) {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <section className="min-h-screen bg-[#101010] text-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto text-center mb-12">
        <h1 className="text-5xl font-bold font-display text-purple-500 drop-shadow-lg">
          Schedule
        </h1>
      </div>

      {loading ? (
        <p className="text-center">Loading events...</p>
      ) : events.length === 0 ? (
        <p className="text-center">No upcoming shows.</p>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <Card key={event.id} className="bg-[#1a1a1a] text-left">
              <CardContent className="p-6">
                <h2 className="text-2xl font-bold text-purple-400 mb-2">
                  {event.summary}
                </h2>
                <p className="text-lg mb-1">
                  <span className="font-semibold">Date:</span>{" "}
                  {formatDate(event.start.dateTime || event.start.date)}
                </p>
                {event.start.dateTime && (
                  <p className="text-lg mb-1">
                    <span className="font-semibold">Time:</span>{" "}
                    {formatTime(event.start.dateTime)} –{" "}
                    {formatTime(event.end?.dateTime)}
                  </p>
                )}
                {event.location && (
                  <p className="text-lg">
                    <span className="font-semibold">Location:</span>{" "}
                    {event.location}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
