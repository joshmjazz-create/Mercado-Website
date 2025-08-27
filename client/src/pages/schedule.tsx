import { useEffect, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Footer from "@/components/footer";

export default function Schedule() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${import.meta.env.VITE_CALENDAR_ID}/events?key=${import.meta.env.VITE_GOOGLE_API_KEY}`
      );
      const data = await response.json();

      const filteredEvents = data.items
        .filter(
          (event) =>
            event.description &&
            event.description.includes("SHOW") &&
            new Date(event.start.dateTime || event.start.date) >= new Date()
        )
        .map((event) => ({
          title: event.summary,
          start: event.start.dateTime || event.start.date,
          end: event.end.dateTime || event.end.date,
        }));

      setEvents(filteredEvents);
    };

    fetchEvents();
  }, []);

  return (
    <>
      <section className="flex flex-col items-center justify-center min-h-screen p-6">
        <h1 className="text-3xl font-bold mb-6 text-purple-500 underline underline-offset-4">
          Schedule
        </h1>
        <div className="w-full max-w-5xl bg-white p-4 rounded-2xl shadow-lg">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            events={events}
            height="auto"
          />
        </div>
      </section>
      <div className="md:hidden">
        <Footer />
      </div>
    </>
  );
}
