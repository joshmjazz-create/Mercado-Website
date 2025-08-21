import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertEventSchema, insertPhotoSchema, insertAlbumSchema } from "@shared/schema";
import { googleApisClient } from "../client/src/lib/google-apis";
import { googleDriveService } from "./google-drive";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Contact form submission
  app.post("/api/contacts", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      res.json({ success: true, contact });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        message: error.message || "Invalid contact data" 
      });
    }
  });

  // Get all contacts (admin endpoint)
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json(contacts);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch contacts" 
      });
    }
  });

  // Get events from Google Calendar (always fresh data)
  app.get("/api/events", async (req, res) => {
    // Set headers to prevent caching
    res.set({
      'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
      'Surrogate-Control': 'no-store'
    });
    
    try {
      // Always fetch fresh data from Google Calendar
      try {
        const googleEvents = await googleApisClient.getCalendarEvents();
        
        // Helper function to determine color from description (only ALL CAPS)
        const getEventColor = (description: string) => {
          if (description.includes('RED')) return 'red';
          if (description.includes('ORANGE')) return 'orange';
          if (description.includes('YELLOW')) return 'yellow';
          if (description.includes('GREEN')) return 'green';
          if (description.includes('BLUE')) return 'blue';
          if (description.includes('PURPLE')) return 'purple';
          if (description.includes('PINK')) return 'pink';
          if (description.includes('TEAL')) return 'teal';
          if (description.includes('CYAN')) return 'cyan';
          if (description.includes('INDIGO')) return 'indigo';
          return 'purple'; // Default to purple instead of 'default'
        };

        // Helper function to clean description (remove SHOW and color keywords)
        const cleanDescription = (description: string) => {
          return description
            .replace(/\bSHOW\b/g, '')
            .replace(/\b(RED|ORANGE|YELLOW|GREEN|BLUE|PURPLE|PINK|TEAL|CYAN|INDIGO)\b/g, '')
            .replace(/\s+/g, ' ')
            .trim();
        };

        // Convert Google Calendar events to our schema and filter for SHOW events only
        const allEvents = googleEvents.map(gEvent => {
          const originalDescription = gEvent.description || "";
          return {
            id: gEvent.id,
            googleEventId: gEvent.id,
            title: gEvent.summary,
            description: cleanDescription(originalDescription),
            startTime: new Date(gEvent.start.dateTime),
            endTime: new Date(gEvent.end.dateTime),
            venue: gEvent.location ? gEvent.location.replace(/\\,/g, ',').replace(/\\\\/g, '\\') : "TBD",
            address: gEvent.location ? gEvent.location.replace(/\\,/g, ',').replace(/\\\\/g, '\\') : "",
            ticketPrice: "",
            ticketUrl: "",
            color: getEventColor(originalDescription),
          };
        });

        // Filter to only show events with exactly "SHOW" in the original description (case-sensitive)
        const events = allEvents.filter((event, index) => {
          const originalDesc = googleEvents[index]?.description || "";
          return originalDesc.includes('SHOW');
        });
        
        // Log for debugging (remove in production)
        allEvents.forEach((event, i) => {
          const originalDesc = googleEvents[i]?.description || "";
          console.log(`Event ${i}: "${event.title}" - Original desc: "${originalDesc}" - Contains SHOW: ${originalDesc.includes('SHOW')}`);
        });
        console.log(`Found ${allEvents.length} total events, ${events.length} with "SHOW" in description`);
        
        // Sort events by start time
        events.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        
        res.json(events);
      } catch (googleError) {
        console.warn('Could not fetch from Google Calendar:', googleError);
        // Fallback to local events if Google Calendar fails
        const localEvents = await storage.getEvents();
        localEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
        res.json(localEvents);
      }
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch events" 
      });
    }
  });

  // Create manual event
  app.post("/api/events", async (req, res) => {
    try {
      const validatedData = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(validatedData);
      res.json({ success: true, event });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        message: error.message || "Invalid event data" 
      });
    }
  });

  // Get photos from Google Drive folder
  app.get("/api/drive/photos/:folderId", async (req, res) => {
    try {
      const { folderId } = req.params;
      
      if (!process.env.GOOGLE_DRIVE_CREDENTIALS) {
        return res.status(500).json({ 
          success: false, 
          message: "Google Drive credentials not configured" 
        });
      }

      const photos = await googleDriveService.getPhotosFromFolder(folderId);
      
      // Transform photos to include direct image URLs  
      const transformedPhotos = photos.map(photo => ({
        ...photo,
        directUrl: googleDriveService.getHighQualityImageUrl(photo.id),
        thumbnailUrl: googleDriveService.getThumbnailFromDrive(photo, 'medium'),
        largeUrl: googleDriveService.getThumbnailFromDrive(photo, 'large'),
        fallbackUrl: googleDriveService.getDirectImageUrl(photo.id, 'medium'),
      }));
      
      res.json(transformedPhotos);
    } catch (error: any) {
      console.error('Drive photos error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch Drive photos" 
      });
    }
  });

  // Get folders within a folder
  app.post('/api/drive/folders', async (req, res) => {
    try {
      const { shareUrl, folderId } = req.body;
      
      let targetFolderId = folderId;
      if (shareUrl && !folderId) {
        targetFolderId = await googleDriveService.extractFolderIdFromShareUrl(shareUrl);
      }
      
      if (!targetFolderId) {
        return res.status(400).json({ error: 'Folder ID or share URL is required' });
      }
      
      const folders = await googleDriveService.getFoldersInFolder(targetFolderId);
      res.json(folders);
    } catch (error) {
      console.error('Drive folders error:', error);
      res.status(500).json({ error: 'Failed to fetch folders from Google Drive' });
    }
  });

  // Get files from a specific folder with optional filtering
  app.post('/api/drive/files', async (req, res) => {
    try {
      const { folderId, mimeTypeFilter } = req.body;
      
      if (!folderId) {
        return res.status(400).json({ error: 'Folder ID is required' });
      }
      
      const files = await googleDriveService.getFilesFromFolder(folderId, mimeTypeFilter);
      res.json(files);
    } catch (error) {
      console.error('Drive files error:', error);
      res.status(500).json({ error: 'Failed to fetch files from Google Drive' });
    }
  });

  // Search for folders recursively
  app.post('/api/drive/search-folders', async (req, res) => {
    try {
      const { parentFolderId, searchTerm, shareUrl } = req.body;
      
      let targetFolderId = parentFolderId;
      if (shareUrl && !parentFolderId) {
        targetFolderId = await googleDriveService.extractFolderIdFromShareUrl(shareUrl);
      }
      
      if (!targetFolderId || !searchTerm) {
        return res.status(400).json({ error: 'Parent folder ID and search term are required' });
      }
      
      const folders = await googleDriveService.searchFoldersRecursively(targetFolderId, searchTerm);
      res.json(folders);
    } catch (error) {
      console.error('Drive folder search error:', error);
      res.status(500).json({ error: 'Failed to search folders in Google Drive' });
    }
  });

  // Image proxy endpoint for Google Drive images
  app.get('/api/image/:fileId', async (req, res) => {
    try {
      const { fileId } = req.params;
      
      // Get file metadata first
      const metadata = await googleDriveService.getFile(fileId);
      if (!metadata.mimeType?.startsWith('image/')) {
        return res.status(400).json({ error: 'File is not an image file' });
      }
      
      // Set appropriate headers for image serving
      res.set({
        'Content-Type': metadata.mimeType,
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Content-Length': metadata.size
      });
      
      // Stream the image file
      const fileStream = await googleDriveService.getFileStream(fileId);
      fileStream.on('error', (err: Error) => {
        console.error('Stream error:', err);
        if (!res.headersSent) {
          res.status(500).json({ error: 'Stream error' });
        }
      });
      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Error streaming image file:', error);
      res.status(500).json({ error: 'Failed to stream image file' });
    }
  });

  // Audio file streaming endpoint for upcoming albums
  app.get('/api/audio/:fileId', async (req, res) => {
    try {
      const { fileId } = req.params;
      
      // Get file metadata first
      const metadata = await googleDriveService.getFile(fileId);
      if (!metadata.mimeType?.startsWith('audio/')) {
        return res.status(400).json({ error: 'File is not an audio file' });
      }
      
      // Set appropriate headers for audio streaming
      res.set({
        'Content-Type': metadata.mimeType,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'public, max-age=3600'
      });
      
      // Stream the audio file
      const fileStream = await googleDriveService.getFileStream(fileId);
      fileStream.pipe(res);
      
    } catch (error) {
      console.error('Error streaming audio file:', error);
      res.status(500).json({ error: 'Failed to stream audio file' });
    }
  });

  // Get music albums from Google Drive
  app.post('/api/drive/music-albums', async (req, res) => {
    try {
      const { shareUrl } = req.body;
      
      if (!shareUrl) {
        return res.status(400).json({ error: 'Share URL is required' });
      }

      const folderId = await googleDriveService.extractFolderIdFromShareUrl(shareUrl);
      if (!folderId) {
        return res.status(400).json({ error: 'Invalid Google Drive share URL' });
      }

      const albums = await googleDriveService.getMusicAlbums(folderId);
      res.json(albums);
    } catch (error) {
      console.error('Drive music albums error:', error);
      res.status(500).json({ error: 'Failed to fetch music albums from Google Drive' });
    }
  });

  // Get photos from Google Drive share URL
  app.post("/api/drive/shared-photos", async (req, res) => {
    try {
      const { shareUrl } = req.body;
      
      if (!process.env.GOOGLE_DRIVE_CREDENTIALS) {
        return res.status(500).json({ 
          success: false, 
          message: "Google Drive credentials not configured" 
        });
      }

      const photos = await googleDriveService.getPublicPhotos(shareUrl);
      
      // Transform photos to include direct image URLs
      const transformedPhotos = photos.map(photo => ({
        ...photo,
        directUrl: googleDriveService.getHighQualityImageUrl(photo.id),
        thumbnailUrl: googleDriveService.getThumbnailFromDrive(photo, 'medium'),
        largeUrl: googleDriveService.getThumbnailFromDrive(photo, 'large'),
        fallbackUrl: googleDriveService.getDirectImageUrl(photo.id, 'medium'),
      }));
      
      res.json(transformedPhotos);
    } catch (error: any) {
      console.error('Drive shared photos error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch shared Drive photos" 
      });
    }
  });

  // Get photos from Google Photos and local storage
  app.get("/api/photos", async (req, res) => {
    try {
      let photos = await storage.getPhotos();
      
      try {
        const googlePhotos = await googleApisClient.getPhotos();
        
        // Convert Google Photos to our schema and sync
        for (const gPhoto of googlePhotos) {
          const existingPhoto = photos.find(p => p.googlePhotoId === gPhoto.id);
          
          if (!existingPhoto) {
            const photoData = {
              title: gPhoto.filename.replace(/\.[^/.]+$/, ""), // Remove extension
              description: "",
              url: gPhoto.baseUrl,
              thumbnailUrl: `${gPhoto.baseUrl}=w400-h300-c`,
              takenAt: gPhoto.mediaMetadata ? new Date(gPhoto.mediaMetadata.creationTime) : new Date(),
              order: 0,
            };
            
            const newPhoto = await storage.createPhoto(photoData, gPhoto.id);
            photos.push(newPhoto);
          }
        }
      } catch (googleError) {
        console.warn('Could not fetch from Google Photos:', googleError);
        // Continue with local photos only
      }
      
      // Sort photos by order and creation date
      photos.sort((a, b) => {
        if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
        return new Date(b.takenAt || 0).getTime() - new Date(a.takenAt || 0).getTime();
      });
      
      res.json(photos);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch photos" 
      });
    }
  });

  // Create manual photo
  app.post("/api/photos", async (req, res) => {
    try {
      const validatedData = insertPhotoSchema.parse(req.body);
      const photo = await storage.createPhoto(validatedData);
      res.json({ success: true, photo });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        message: error.message || "Invalid photo data" 
      });
    }
  });

  // Albums API routes
  app.get("/api/albums", async (req, res) => {
    try {
      const albums = await storage.getAlbums();
      res.json(albums);
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch albums" 
      });
    }
  });

  app.post("/api/albums", async (req, res) => {
    try {
      const validatedData = insertAlbumSchema.parse(req.body);
      const album = await storage.createAlbum(validatedData);
      res.json({ success: true, album });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        message: error.message || "Invalid album data" 
      });
    }
  });

  app.put("/api/albums/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const validatedData = insertAlbumSchema.partial().parse(req.body);
      const album = await storage.updateAlbum(id, validatedData);
      
      if (!album) {
        return res.status(404).json({ 
          success: false, 
          message: "Album not found" 
        });
      }
      
      res.json({ success: true, album });
    } catch (error: any) {
      res.status(400).json({ 
        success: false, 
        message: error.message || "Invalid album data" 
      });
    }
  });

  app.delete("/api/albums/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const deleted = await storage.deleteAlbum(id);
      
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          message: "Album not found" 
        });
      }
      
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to delete album" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
