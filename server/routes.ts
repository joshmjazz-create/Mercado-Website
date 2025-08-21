import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertEventSchema, insertPhotoSchema, insertAlbumSchema } from "@shared/schema";
import { googleApisClient } from "../client/src/lib/google-apis";

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
        
        // Helper function to determine color from description
        const getEventColor = (description: string) => {
          const desc = description.toLowerCase();
          if (desc.includes('red')) return 'red';
          if (desc.includes('orange')) return 'orange';
          if (desc.includes('yellow')) return 'yellow';
          if (desc.includes('green')) return 'green';
          if (desc.includes('blue')) return 'blue';
          if (desc.includes('purple')) return 'purple';
          if (desc.includes('pink')) return 'pink';
          if (desc.includes('teal')) return 'teal';
          if (desc.includes('cyan')) return 'cyan';
          if (desc.includes('indigo')) return 'indigo';
          return 'default';
        };

        // Convert Google Calendar events to our schema and filter for SHOW events only
        const allEvents = googleEvents.map(gEvent => ({
          id: gEvent.id,
          googleEventId: gEvent.id,
          title: gEvent.summary,
          description: gEvent.description || "",
          startTime: new Date(gEvent.start.dateTime),
          endTime: new Date(gEvent.end.dateTime),
          venue: gEvent.location ? gEvent.location.replace(/\\,/g, ',').replace(/\\\\/g, '\\') : "TBD",
          address: gEvent.location ? gEvent.location.replace(/\\,/g, ',').replace(/\\\\/g, '\\') : "",
          ticketPrice: "",
          ticketUrl: "",
          color: getEventColor(gEvent.description || ""),
        }));

        // Filter to only show events with exactly "SHOW" in the description (case-sensitive)
        const events = allEvents.filter(event => 
          event.description.includes('SHOW')
        );
        
        // Log for debugging (remove in production)
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
