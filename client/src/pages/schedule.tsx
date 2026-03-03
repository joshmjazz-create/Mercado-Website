import { useState, useEffect } from "react";
import { MapPin, Calendar, Clock } from "lucide-react";
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

  // ✅ NEW STATE FOR PROMO IMAGE
  const [promoImage, setPromoImage] = useState<string | null>(null);
  const [showPromo, setShowPromo] = useState(true);

  useEffect(() => {
    document.title = "Schedule";
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const CALENDAR_ID = "joshm.jazz@gmail.com";
        const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";
        const response = await fetch(
          `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
            CALENDAR_ID
          )}/events?key=${API_KEY}&timeMin=${new Date().toISOString()}&singleEvents=true&orderBy=startTime&maxResults=366`
        );

        if (response.ok) {
          const data = await response.json();
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
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // ✅ NEW USEEFFECT TO FETCH PROMO IMAGE FROM DRIVE FOLDER
  useEffect(() => {
    const fetchPromoImage = async () => {
      try {
        const FOLDER_ID = "16LRiz2HqAzL2hELbP6Az6GXj_7kdnZW4";
        const API_KEY = "AIzaSyDSYNweU099_DLxYW7ICIn7MapibjSquYI";

        const res = await fetch(
          `https://www.googleapis.com/drive/v3/files?q='${FOLDER_ID}'+in+parents+and+mimeType+contains+'image'&key=${API_KEY}&fields=files(id,name)`
        );

        if (!res.ok) return;

        const data = await res.json();
        if (data.files && data.files.length > 0) {
          const imageId = data.files[0].id;
          setPromoImage(`https://lh3.googleusercontent.com/d/${imageId}`);
        }
      } catch (error) {
        console.error("Promo image fetch error:", error);
      }
    };

    fetchPromoImage();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  };

  const cleanLocation = (location?: string) => {
    if (!location) return "";
    return location.replace(/\\/g, "");
  };

  const getEventLink = (description?: string) => {
    if (!description) return undefined;
    const urlRegex = /(https?:\/\/[^\s]+)/;
    const match = description.match(urlRegex);
    return match ? match[0] : undefined;
  };

  return (
    <>
      <section className="min-h-screen md:fit-screen bg-jazz-grey">
        <div className="container mx-auto px-4 py-8">
          {/* Page Title */}
          <div className="text-center mb-8 opacity-0 translate-y-4 animate-in" style={{ animationDelay: "200ms" }}>
            <h1 className="text-5xl font-bold text-purple-500 mb-6">Schedule</h1>
            <div className="w-24 h-1 bg-purple-500 mx-auto"></div>
          </div>

          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
          )}

          {!loading && events.length > 0 && (
            <div className="space-y-2 opacity-0 translate-y-4 animate-in" style={{ animationDelay: "400ms" }}>
              {events
                .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
                .map((event, index) => {
                  const eventLink = getEventLink(event.description);
                  return (
                    <div
                      key={event.id}
                      className={`flex items-center justify-between py-3 border-b border-gray-300`}
                    >
                      {/* Title */}
                      <div className="flex-1 text-gray-700">
                        {eventLink ? (
                          <a href={eventLink} target="_blank" rel="noopener noreferrer" className="font-semibold text-lg underline hover:text-gray-900">
                            {event.summary}
                          </a>
                        ) : (
                          <span className="font-semibold text-lg">{event.summary}</span>
                        )}
                      </div>

                      {/* Date & Time */}
                      <div className="flex-1 text-center text-gray-700">
                        <div className="font-medium">{formatDate(event.start.dateTime)}</div>
                        <div className="text-sm">{formatTime(event.start.dateTime)}</div>
                      </div>

                      {/* Location */}
                      <div className="flex-1 text-right text-gray-700">
                        {event.location && (
                          <a
                            href={`https://maps.google.com/?q=${encodeURIComponent(cleanLocation(event.location))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-gray-900"
                          >
                            {cleanLocation(event.location)}
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </section>

      {/* ✅ FULLSCREEN PROMO POPUP */}
      {promoImage && showPromo && (
        <div
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          onClick={() => setShowPromo(false)}
        >
          <div className="relative w-full h-full flex items-center justify-center p-6">
            <img
              src={promoImage}
              alt="Upcoming Event"
              className="max-w-full max-h-full object-contain"
            />

            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowPromo(false);
              }}
              className="absolute top-6 right-6 text-white hover:text-purple-500 text-4xl font-bold bg-black bg-opacity-70 rounded-full w-12 h-12 flex items-center justify-center transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Mobile Footer */}
      <div className="md:hidden">
        <Footer />
      </div>
    </>
  );
}
