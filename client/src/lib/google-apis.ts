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
    // Use the public calendar directly - no API key needed for public calendars
    const publicCalendarId = 'joshm.jazz@gmail.com';
    
    if (!this.calendarApiKey) {
      throw new Error('Google Calendar API key not configured');
    }

    const now = new Date().toISOString();
    const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(publicCalendarId)}/events?key=${this.calendarApiKey}&timeMin=${now}&singleEvents=true&orderBy=startTime&maxResults=10`;

    try {
      const response = await fetch(url);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Calendar API error response:`, errorText);
        throw new Error(`Calendar API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error('Error fetching calendar events:', error);
      throw error;
    }
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
