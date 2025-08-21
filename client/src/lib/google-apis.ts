// Environment variables for Google APIs
const getEnvVar = (name: string) => {
  if (typeof window !== 'undefined') {
    // Client-side: use import.meta.env
    return (import.meta.env as any)[`VITE_${name}`];
  } else {
    // Server-side: use process.env
    return process.env[name];
  }
};

const GOOGLE_CALENDAR_API_KEY = getEnvVar('GOOGLE_API_KEY');
const GOOGLE_PHOTOS_API_KEY = getEnvVar('GOOGLE_PHOTOS_API_KEY');
const CALENDAR_ID = getEnvVar('GOOGLE_CALENDAR_ID');

export interface GoogleCalendarEvent {
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
}

export interface GooglePhoto {
  id: string;
  baseUrl: string;
  filename: string;
  mimeType: string;
  mediaMetadata?: {
    creationTime: string;
    width: string;
    height: string;
  };
}

export class GoogleApisClient {
  private calendarApiKey: string;
  private photosApiKey: string;
  private calendarId: string;

  constructor() {
    this.calendarApiKey = GOOGLE_CALENDAR_API_KEY || '';
    this.photosApiKey = GOOGLE_PHOTOS_API_KEY || '';
    this.calendarId = CALENDAR_ID || '';
  }

  async getCalendarEvents(): Promise<GoogleCalendarEvent[]> {
    // Use public iCal feed - no API key needed for public calendars
    const publicCalendarId = 'joshm.jazz@gmail.com';
    
    try {
      const icalUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(publicCalendarId)}/public/basic.ics`;
      const response = await fetch(icalUrl);
      
      if (!response.ok) {
        throw new Error(`Calendar feed error: ${response.status} ${response.statusText}`);
      }
      
      const icalData = await response.text();
      return this.parseICalData(icalData);
      
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
  }

  private parseICalData(icalData: string): GoogleCalendarEvent[] {
    const events: GoogleCalendarEvent[] = [];
    const lines = icalData.split('\n');
    let currentEvent: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {};
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.summary && currentEvent.dtstart) {
          events.push({
            id: currentEvent.uid || Date.now().toString(),
            summary: currentEvent.summary,
            description: currentEvent.description || '',
            start: {
              dateTime: this.parseICalDateTime(currentEvent.dtstart),
              timeZone: 'America/New_York'
            },
            end: {
              dateTime: this.parseICalDateTime(currentEvent.dtend || currentEvent.dtstart),
              timeZone: 'America/New_York'
            },
            location: currentEvent.location || ''
          });
        }
        currentEvent = null;
      } else if (currentEvent && line.includes(':')) {
        const [key, ...valueParts] = line.split(':');
        const value = valueParts.join(':');
        
        switch (key) {
          case 'SUMMARY':
            currentEvent.summary = value;
            break;
          case 'DESCRIPTION':
            currentEvent.description = value;
            break;
          case 'DTSTART':
            currentEvent.dtstart = value;
            break;
          case 'DTEND':
            currentEvent.dtend = value;
            break;
          case 'LOCATION':
            currentEvent.location = value;
            break;
          case 'UID':
            currentEvent.uid = value;
            break;
        }
      }
    }
    
    // Filter future events only and sort by start time
    const now = new Date();
    return events
      .filter(event => new Date(event.start.dateTime) >= now)
      .sort((a, b) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime())
      .slice(0, 10);
  }

  private parseICalDateTime(icalDateTime: string): string {
    // Parse iCal datetime format (YYYYMMDDTHHMMSSZ) to ISO string
    if (!icalDateTime) return new Date().toISOString();
    
    const match = icalDateTime.match(/(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})/);
    if (match) {
      const [, year, month, day, hour, minute, second] = match;
      return new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}Z`).toISOString();
    }
    
    return new Date().toISOString();
  }

  async getPhotos(): Promise<GooglePhoto[]> {
    if (!this.photosApiKey) {
      throw new Error('Google Photos API key not configured');
    }

    // Note: Google Photos API requires OAuth 2.0 authentication
    // This is a simplified example - in production you would need proper OAuth flow
    try {
      // For now, return empty array since Photos API requires complex authentication
      console.warn('Google Photos API requires OAuth 2.0 authentication');
      return [];
    } catch (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }
  }
}

export const googleApisClient = new GoogleApisClient();
