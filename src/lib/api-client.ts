// Client-side API calls for GitHub Pages deployment
// These functions will make direct API calls from the frontend

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

// Google Calendar API - Direct client calls
export async function fetchEvents() {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CALENDAR_ID}/events?key=${GOOGLE_API_KEY}&timeMin=${new Date().toISOString()}&maxResults=50&singleEvents=true&orderBy=startTime`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch events');
    
    const data = await response.json();
    const events = data.items || [];
    
    // Filter events that contain "SHOW" in description
    return events.filter((event: any) => 
      event.description && event.description.includes('SHOW')
    );
  } catch (error) {
    console.error('Error fetching events:', error);
    return [];
  }
}

// Google Drive API calls for static content
export async function fetchBiography() {
  // For GitHub Pages, we'll pre-build the content during build time
  // This function will fetch from a static JSON file generated during build
  try {
    const response = await fetch('/api/biography.json');
    if (!response.ok) throw new Error('Failed to fetch biography');
    return await response.json();
  } catch (error) {
    console.error('Error fetching biography:', error);
    return { biography: 'Biography content unavailable.' };
  }
}

export async function fetchPhotos() {
  try {
    const response = await fetch('/api/photos.json');
    if (!response.ok) throw new Error('Failed to fetch photos');
    return await response.json();
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

export async function fetchMusicAlbums() {
  try {
    const response = await fetch('/api/albums.json');
    if (!response.ok) throw new Error('Failed to fetch albums');
    return await response.json();
  } catch (error) {
    console.error('Error fetching albums:', error);
    return { original: [], featured: [], upcoming: [] };
  }
}