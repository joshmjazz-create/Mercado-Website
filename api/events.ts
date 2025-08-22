import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const calendar = google.calendar('v3');
    const auth = new google.auth.GoogleAuth({
      credentials: JSON.parse(process.env.GOOGLE_DRIVE_CREDENTIALS || '{}'),
      scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    });

    const authClient = await auth.getClient();
    google.options({ auth: authClient });

    const now = new Date();
    const response = await calendar.events.list({
      calendarId: process.env.GOOGLE_CALENDAR_ID,
      timeMin: now.toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = response.data.items || [];
    
    // Filter events that contain "SHOW" in description
    const showEvents = events.filter(event => 
      event.description && event.description.includes('SHOW')
    );

    res.json(showEvents);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}