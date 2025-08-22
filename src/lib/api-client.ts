// Pure client-side API calls for GitHub Pages deployment
// All Google API calls happen directly from the browser

// Type declarations for Google API
declare global {
  interface Window {
    gapi: any;
    ENV?: {
      GOOGLE_API_KEY: string;
      GOOGLE_CALENDAR_ID: string;
      BIOGRAPHY_DOC_ID?: string;
      PHOTOS_FOLDER_ID?: string;
      MUSIC_FOLDER_ID?: string;
    };
  }
}

// Environment variables
const GOOGLE_API_KEY = (import.meta as any).env?.VITE_GOOGLE_API_KEY || window.ENV?.GOOGLE_API_KEY;
const GOOGLE_CALENDAR_ID = (import.meta as any).env?.VITE_GOOGLE_CALENDAR_ID || window.ENV?.GOOGLE_CALENDAR_ID;

// For Google Drive API calls, we need the service account key
// But for security, we'll use a different approach for Drive content

// Google Calendar API - Direct client calls (CORS enabled)
export async function fetchEvents() {
  if (!GOOGLE_API_KEY || !GOOGLE_CALENDAR_ID) {
    console.error('Missing Google API credentials');
    return [];
  }

  // Make calendar public readable: Calendar Settings → Access permissions → Make available to public
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(GOOGLE_CALENDAR_ID)}/events?key=${GOOGLE_API_KEY}&timeMin=${new Date().toISOString()}&maxResults=50&singleEvents=true&orderBy=startTime`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) {
      if (response.status === 403) {
        console.error('Calendar access denied. Make sure calendar is public and API key has Calendar API enabled.');
      }
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

// Google Drive API - Public file access
export async function fetchBiography() {
  if (!GOOGLE_API_KEY) {
    console.error('Missing Google API key');
    return { biography: 'API key required for biography content.' };
  }

  try {
    // Initialize Google API client if not already done
    await initializeGoogleAPI();
    
    // Replace with your actual Google Doc ID
    // Get this from the Doc URL: https://docs.google.com/document/d/[DOC_ID]/edit
    const DOC_ID = (import.meta as any).env?.VITE_BIOGRAPHY_DOC_ID || window.ENV?.BIOGRAPHY_DOC_ID || 'YOUR_BIOGRAPHY_DOC_ID';
    
    const response = await window.gapi.client.docs.documents.get({
      documentId: DOC_ID
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
    
    return { biography: biography.trim() };
  } catch (error) {
    console.error('Error fetching biography:', error);
    if (error.status === 403) {
      return { biography: 'Biography document must be made publicly accessible. Go to File → Share → Anyone with the link can view.' };
    }
    return { biography: 'Biography content temporarily unavailable.' };
  }
}

export async function fetchPhotos() {
  if (!GOOGLE_API_KEY) {
    console.error('Missing Google API key');
    return [];
  }

  try {
    await initializeGoogleAPI();
    
    // Replace with your actual Google Drive folder ID
    // Get this from folder URL: https://drive.google.com/drive/folders/[FOLDER_ID]
    const PHOTOS_FOLDER_ID = (import.meta as any).env?.VITE_PHOTOS_FOLDER_ID || window.ENV?.PHOTOS_FOLDER_ID || 'YOUR_PHOTOS_FOLDER_ID';
    
    const response = await window.gapi.client.drive.files.list({
      q: `'${PHOTOS_FOLDER_ID}' in parents and mimeType contains 'image/'`,
      fields: 'files(id,name,webViewLink,webContentLink,thumbnailLink)',
      orderBy: 'name'
    });
    
    const files = response.result.files || [];
    
    // Convert to format expected by your gallery
    return files.map((file: any) => ({
      id: file.id,
      name: file.name,
      url: `https://drive.google.com/uc?id=${file.id}`,
      thumbnailUrl: file.thumbnailLink,
      webViewLink: file.webViewLink
    }));
  } catch (error) {
    console.error('Error fetching photos:', error);
    if (error.status === 403) {
      console.error('Photos folder must be publicly accessible: Right-click folder → Share → Anyone with the link can view');
    }
    return [];
  }
}

export async function fetchMusicAlbums() {
  if (!GOOGLE_API_KEY) {
    console.error('Missing Google API key');
    return { original: [], featured: [], upcoming: [] };
  }

  try {
    await initializeGoogleAPI();
    
    // Replace with your actual Music folder ID
    const MUSIC_FOLDER_ID = (import.meta as any).env?.VITE_MUSIC_FOLDER_ID || window.ENV?.MUSIC_FOLDER_ID || 'YOUR_MUSIC_FOLDER_ID';
    
    // Get category folders (My Music, Featured On, Upcoming)
    const foldersResponse = await window.gapi.client.drive.files.list({
      q: `'${MUSIC_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder'`,
      fields: 'files(id,name)'
    });
    
    const categoryFolders = foldersResponse.result.files || [];
    const categories = { original: [], featured: [], upcoming: [] };
    
    // Process each category folder
    for (const folder of categoryFolders) {
      const folderName = folder.name.toLowerCase();
      let categoryKey = 'original';
      
      if (folderName.includes('featured')) categoryKey = 'featured';
      else if (folderName.includes('upcoming')) categoryKey = 'upcoming';
      
      // Get album folders within this category
      const albumsResponse = await window.gapi.client.drive.files.list({
        q: `'${folder.id}' in parents and mimeType='application/vnd.google-apps.folder'`,
        fields: 'files(id,name)'
      });
      
      const albumFolders = albumsResponse.result.files || [];
      
      // Process each album folder
      for (const albumFolder of albumFolders) {
        try {
          // Look for Google Doc with album info in this folder
          const docsResponse = await window.gapi.client.drive.files.list({
            q: `'${albumFolder.id}' in parents and mimeType='application/vnd.google-apps.document'`,
            fields: 'files(id,name)'
          });
          
          if (docsResponse.result.files?.length > 0) {
            const docId = docsResponse.result.files[0].id;
            
            // Fetch document content
            const docResponse = await window.gapi.client.docs.documents.get({
              documentId: docId
            });
            
            // Parse album information from document
            const albumData = parseAlbumDocument(docResponse.result);
            if (albumData) {
              categories[categoryKey].push(albumData);
            }
          }
        } catch (error) {
          console.error(`Error processing album folder ${albumFolder.name}:`, error);
        }
      }
    }
    
    return categories;
  } catch (error) {
    console.error('Error fetching music albums:', error);
    if (error.status === 403) {
      console.error('Music folder must be publicly accessible: Right-click folder → Share → Anyone with the link can view');
    }
    return { original: [], featured: [], upcoming: [] };
  }
}

// Helper function to parse album document content
function parseAlbumDocument(doc: any) {
  try {
    const content = doc.body?.content || [];
    let text = '';
    
    content.forEach((element: any) => {
      if (element.paragraph?.elements) {
        element.paragraph.elements.forEach((el: any) => {
          if (el.textRun?.content) {
            text += el.textRun.content;
          }
        });
      }
    });
    
    // Parse the text for album information
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const album: any = { platforms: {} };
    
    lines.forEach(line => {
      if (line.startsWith('TITLE:')) {
        album.title = line.replace('TITLE:', '').trim();
      } else if (line.startsWith('ARTIST:')) {
        album.artist = line.replace('ARTIST:', '').trim();
      } else if (line.startsWith('YEAR:')) {
        album.year = parseInt(line.replace('YEAR:', '').trim());
      } else if (line.startsWith('SPOTIFY:')) {
        album.platforms.spotify = line.replace('SPOTIFY:', '').trim();
      } else if (line.startsWith('APPLE:')) {
        album.platforms.apple = line.replace('APPLE:', '').trim();
      } else if (line.startsWith('YOUTUBE:')) {
        album.platforms.youtube = line.replace('YOUTUBE:', '').trim();
      }
    });
    
    return album.title ? album : null;
  } catch (error) {
    console.error('Error parsing album document:', error);
    return null;
  }
}

// Initialize Google API client
export async function initializeGoogleAPI(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    if (typeof window.gapi === 'undefined') {
      // Load Google API client
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
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
      // API already loaded, just initialize if needed
      if (!window.gapi.client) {
        window.gapi.load('client', async () => {
          try {
            await window.gapi.client.init({
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
      } else {
        resolve(true);
      }
    }
  });
}