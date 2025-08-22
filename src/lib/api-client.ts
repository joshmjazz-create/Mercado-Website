// Pure client-side API calls for GitHub Pages deployment
// All Google API calls happen directly from the browser

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY;
const GOOGLE_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID;

// For Google Drive API calls, we need the service account key
// But for security, we'll use a different approach for Drive content

// Google Calendar API - Direct client calls (CORS enabled)
export async function fetchEvents() {
  if (!GOOGLE_API_KEY || !GOOGLE_CALENDAR_ID) {
    console.error('Missing Google API credentials');
    return [];
  }

  const url = `https://www.googleapis.com/calendar/v3/calendars/${GOOGLE_CALENDAR_ID}/events?key=${GOOGLE_API_KEY}&timeMin=${new Date().toISOString()}&maxResults=50&singleEvents=true&orderBy=startTime`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error('Calendar API error:', response.status, response.statusText);
      return [];
    }
    
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

// Google Drive API - Client-side calls using CORS
export async function fetchBiography() {
  // For pure static hosting, we can use Google Drive's public file sharing
  // or we need to make authenticated calls using the Google API client library
  
  if (!GOOGLE_API_KEY) {
    console.error('Missing Google API key');
    return { biography: 'API key required for biography content.' };
  }

  try {
    // Alternative: Use a public Google Doc or Drive file
    // This would require the document to be publicly accessible
    const response = await gapi.client.docs.documents.get({
      documentId: 'YOUR_BIOGRAPHY_DOC_ID'
    });
    
    // Parse Google Docs content
    const content = response.result.body?.content || [];
    let biography = '';
    
    content.forEach((element: any) => {
      if (element.paragraph?.elements) {
        element.paragraph.elements.forEach((el: any) => {
          if (el.textRun?.content) {
            biography += el.textRun.content;
          }
        });
      }
    });
    
    return { biography };
  } catch (error) {
    console.error('Error fetching biography:', error);
    return { biography: 'Biography content temporarily unavailable.' };
  }
}

export async function fetchPhotos() {
  if (!GOOGLE_API_KEY) {
    console.error('Missing Google API key');
    return [];
  }

  try {
    // Use Google Drive API to fetch photos from a shared folder
    const response = await gapi.client.drive.files.list({
      q: "'YOUR_PHOTOS_FOLDER_ID' in parents and mimeType contains 'image/'",
      fields: 'files(id,name,webViewLink,thumbnailLink)'
    });
    
    return response.result.files || [];
  } catch (error) {
    console.error('Error fetching photos:', error);
    return [];
  }
}

export async function fetchMusicAlbums() {
  if (!GOOGLE_API_KEY) {
    console.error('Missing Google API key');
    return { original: [], featured: [], upcoming: [] };
  }

  try {
    // Fetch album data from Google Drive folders structure
    const response = await gapi.client.drive.files.list({
      q: "'YOUR_MUSIC_FOLDER_ID' in parents and mimeType='application/vnd.google-apps.folder'",
      fields: 'files(id,name)'
    });
    
    // Process each category folder
    const folders = response.result.files || [];
    const categories = { original: [], featured: [], upcoming: [] };
    
    // This would need more complex logic to parse the folder structure
    // and extract album information from Google Docs within each folder
    
    return categories;
  } catch (error) {
    console.error('Error fetching music albums:', error);
    return { original: [], featured: [], upcoming: [] };
  }
}

// Initialize Google API client
export async function initializeGoogleAPI() {
  return new Promise((resolve, reject) => {
    if (typeof gapi === 'undefined') {
      // Load Google API client
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        gapi.load('client', async () => {
          try {
            await gapi.client.init({
              apiKey: GOOGLE_API_KEY,
              discoveryDocs: [
                'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
                'https://docs.googleapis.com/$discovery/rest?version=v1'
              ]
            });
            resolve(true);
          } catch (error) {
            reject(error);
          }
        });
      };
      script.onerror = reject;
      document.head.appendChild(script);
    } else {
      resolve(true);
    }
  });
}