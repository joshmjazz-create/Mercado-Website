import { type User, type InsertUser, type Event, type InsertEvent, type Photo, type InsertPhoto, type Contact, type InsertContact, type Album, type InsertAlbum } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Events
  getEvents(): Promise<Event[]>;
  getEvent(id: string): Promise<Event | undefined>;
  createEvent(event: InsertEvent, googleEventId?: string): Promise<Event>;
  updateEvent(id: string, event: Partial<Event>): Promise<Event | undefined>;
  deleteEvent(id: string): Promise<boolean>;
  
  // Photos
  getPhotos(): Promise<Photo[]>;
  getPhoto(id: string): Promise<Photo | undefined>;
  createPhoto(photo: InsertPhoto, googlePhotoId?: string): Promise<Photo>;
  updatePhoto(id: string, photo: Partial<Photo>): Promise<Photo | undefined>;
  deletePhoto(id: string): Promise<boolean>;
  
  // Contacts
  getContacts(): Promise<Contact[]>;
  getContact(id: string): Promise<Contact | undefined>;
  createContact(contact: InsertContact): Promise<Contact>;
  
  // Albums
  getAlbums(): Promise<Album[]>;
  getAlbum(id: string): Promise<Album | undefined>;
  createAlbum(album: InsertAlbum): Promise<Album>;
  updateAlbum(id: string, album: Partial<Album>): Promise<Album | undefined>;
  deleteAlbum(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private photos: Map<string, Photo>;
  private contacts: Map<string, Contact>;
  private albums: Map<string, Album>;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.photos = new Map();
    this.contacts = new Map();
    this.albums = new Map();
    
    // Add sample album
    this.initializeAlbums();
  }

  private initializeAlbums() {
    const albums: Album[] = [
      // Original Music
      {
        id: "rgb-album-1",
        title: "RGB",
        artist: "Joshua Mercado",
        description: "Original composition featuring abstract colors and jazz fusion",
        coverImageUrl: "/client/src/assets/rgb-album-cover.jpg",
        spotifyUrl: "https://open.spotify.com/track/3m88YPqvxIj4VV0JJKR5FZ?si=KUHFqxetQw20rCzbYi71sA",
        appleMusicUrl: "https://music.apple.com/us/song/26-2/962199389",
        youtubeUrl: "https://youtu.be/OQoP9uFV_LA?si=5eET74_q1rizgNN8",
        releaseDate: "2024-01-01",
        category: "original",
        audioPreviewUrl: null,
        createdAt: new Date()
      },
      {
        id: "jazz-fusion-2",
        title: "Jazz Fusion",
        artist: "Joshua Mercado",
        description: "Contemporary jazz with modern influences",
        coverImageUrl: "/client/src/assets/rgb-album-cover.jpg",
        spotifyUrl: "https://open.spotify.com/track/3m88YPqvxIj4VV0JJKR5FZ?si=KUHFqxetQw20rCzbYi71sA",
        appleMusicUrl: "https://music.apple.com/us/song/26-2/962199389",
        youtubeUrl: "https://youtu.be/OQoP9uFV_LA?si=5eET74_q1rizgNN8",
        releaseDate: "2023-12-15",
        category: "original",
        audioPreviewUrl: null,
        createdAt: new Date()
      },
      {
        id: "blue-notes-3",
        title: "Blue Notes",
        artist: "Joshua Mercado",
        description: "Classic jazz standards with a modern twist",
        coverImageUrl: "/client/src/assets/rgb-album-cover.jpg",
        spotifyUrl: "https://open.spotify.com/track/3m88YPqvxIj4VV0JJKR5FZ?si=KUHFqxetQw20rCzbYi71sA",
        appleMusicUrl: "https://music.apple.com/us/song/26-2/962199389",
        youtubeUrl: "https://youtu.be/OQoP9uFV_LA?si=5eET74_q1rizgNN8",
        releaseDate: "2023-11-20",
        category: "original",
        audioPreviewUrl: null,
        createdAt: new Date()
      },
      {
        id: "midnight-sessions-4",
        title: "Midnight Sessions",
        artist: "Joshua Mercado",
        description: "Late night jazz improvisations",
        coverImageUrl: "/client/src/assets/rgb-album-cover.jpg",
        spotifyUrl: "https://open.spotify.com/track/3m88YPqvxIj4VV0JJKR5FZ?si=KUHFqxetQw20rCzbYi71sA",
        appleMusicUrl: "https://music.apple.com/us/song/26-2/962199389",
        youtubeUrl: "https://youtu.be/OQoP9uFV_LA?si=5eET74_q1rizgNN8",
        releaseDate: "2023-10-05",
        category: "original",
        audioPreviewUrl: null,
        createdAt: new Date()
      },
      // Featured On
      {
        id: "big-band-sessions-5",
        title: "Big Band Sessions",
        artist: "Metropolitan Jazz Ensemble feat. Joshua Mercado",
        description: "Featured trumpet performance on swing classics",
        coverImageUrl: "/client/src/assets/rgb-album-cover.jpg",
        spotifyUrl: "https://open.spotify.com/track/3m88YPqvxIj4VV0JJKR5FZ?si=KUHFqxetQw20rCzbYi71sA",
        appleMusicUrl: "https://music.apple.com/us/song/26-2/962199389",
        youtubeUrl: "https://youtu.be/OQoP9uFV_LA?si=5eET74_q1rizgNN8",
        releaseDate: "2023-08-10",
        category: "featured",
        audioPreviewUrl: null,
        createdAt: new Date()
      },
      {
        id: "latin-rhythms-6",
        title: "Latin Rhythms",
        artist: "Salsa Collective feat. Joshua Mercado",
        description: "Piano and trumpet on Latin jazz fusion",
        coverImageUrl: "/client/src/assets/rgb-album-cover.jpg",
        spotifyUrl: "https://open.spotify.com/track/3m88YPqvxIj4VV0JJKR5FZ?si=KUHFqxetQw20rCzbYi71sA",
        appleMusicUrl: "https://music.apple.com/us/song/26-2/962199389",
        youtubeUrl: "https://youtu.be/OQoP9uFV_LA?si=5eET74_q1rizgNN8",
        releaseDate: "2023-06-22",
        category: "featured",
        audioPreviewUrl: null,
        createdAt: new Date()
      },
      // Upcoming
      {
        id: "noir-nights-7",
        title: "Noir Nights",
        artist: "Joshua Mercado",
        description: "Dark jazz compositions with film noir influences",
        coverImageUrl: "/client/src/assets/rgb-album-cover.jpg",
        spotifyUrl: null,
        appleMusicUrl: null,
        youtubeUrl: null,
        releaseDate: "2024-03-15",
        category: "upcoming",
        audioPreviewUrl: "/client/src/assets/noir-nights-preview.mp3",
        createdAt: new Date()
      },
      {
        id: "urban-symphony-8",
        title: "Urban Symphony",
        artist: "Joshua Mercado",
        description: "Modern jazz meets city soundscapes",
        coverImageUrl: "/client/src/assets/rgb-album-cover.jpg",
        spotifyUrl: null,
        appleMusicUrl: null,
        youtubeUrl: null,
        releaseDate: "2024-05-01",
        category: "upcoming",
        audioPreviewUrl: "/client/src/assets/urban-symphony-preview.wav",
        createdAt: new Date()
      }
    ];
    
    albums.forEach(album => this.albums.set(album.id, album));
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async getEvent(id: string): Promise<Event | undefined> {
    return this.events.get(id);
  }

  async createEvent(insertEvent: InsertEvent, googleEventId?: string): Promise<Event> {
    const id = randomUUID();
    const event: Event = { 
      ...insertEvent, 
      id,
      address: insertEvent.address ?? null,
      description: insertEvent.description ?? null,
      ticketPrice: insertEvent.ticketPrice ?? null,
      ticketUrl: insertEvent.ticketUrl ?? null,
      googleEventId: googleEventId || null,
      color: insertEvent.color ?? null
    };
    this.events.set(id, event);
    return event;
  }

  async updateEvent(id: string, updateData: Partial<Event>): Promise<Event | undefined> {
    const event = this.events.get(id);
    if (!event) return undefined;
    
    const updatedEvent = { ...event, ...updateData };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }

  async deleteEvent(id: string): Promise<boolean> {
    return this.events.delete(id);
  }

  // Photos
  async getPhotos(): Promise<Photo[]> {
    return Array.from(this.photos.values());
  }

  async getPhoto(id: string): Promise<Photo | undefined> {
    return this.photos.get(id);
  }

  async createPhoto(insertPhoto: InsertPhoto, googlePhotoId?: string): Promise<Photo> {
    const id = randomUUID();
    const photo: Photo = { 
      ...insertPhoto, 
      id,
      description: insertPhoto.description ?? null,
      thumbnailUrl: insertPhoto.thumbnailUrl ?? null,
      takenAt: insertPhoto.takenAt ?? null,
      order: insertPhoto.order ?? null,
      googlePhotoId: googlePhotoId || null 
    };
    this.photos.set(id, photo);
    return photo;
  }

  async updatePhoto(id: string, updateData: Partial<Photo>): Promise<Photo | undefined> {
    const photo = this.photos.get(id);
    if (!photo) return undefined;
    
    const updatedPhoto = { ...photo, ...updateData };
    this.photos.set(id, updatedPhoto);
    return updatedPhoto;
  }

  async deletePhoto(id: string): Promise<boolean> {
    return this.photos.delete(id);
  }

  // Contacts
  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async getContact(id: string): Promise<Contact | undefined> {
    return this.contacts.get(id);
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const id = randomUUID();
    const contact: Contact = { 
      ...insertContact, 
      id,
      phone: insertContact.phone ?? null,
      eventType: insertContact.eventType ?? null,
      eventDate: insertContact.eventDate ?? null,
      message: insertContact.message ?? null,
      createdAt: new Date()
    };
    this.contacts.set(id, contact);
    return contact;
  }

  // Albums
  async getAlbums(): Promise<Album[]> {
    return Array.from(this.albums.values());
  }

  async getAlbum(id: string): Promise<Album | undefined> {
    return this.albums.get(id);
  }

  async createAlbum(insertAlbum: InsertAlbum): Promise<Album> {
    const id = randomUUID();
    const album: Album = { 
      ...insertAlbum, 
      id,
      description: insertAlbum.description ?? null,
      releaseDate: insertAlbum.releaseDate ?? null,
      spotifyUrl: insertAlbum.spotifyUrl ?? null,
      appleMusicUrl: insertAlbum.appleMusicUrl ?? null,
      youtubeUrl: insertAlbum.youtubeUrl ?? null,
      category: insertAlbum.category ?? "original",
      audioPreviewUrl: insertAlbum.audioPreviewUrl ?? null,
      createdAt: new Date()
    };
    this.albums.set(id, album);
    return album;
  }

  async updateAlbum(id: string, updateData: Partial<Album>): Promise<Album | undefined> {
    const album = this.albums.get(id);
    if (!album) return undefined;
    
    const updatedAlbum = { ...album, ...updateData };
    this.albums.set(id, updatedAlbum);
    return updatedAlbum;
  }

  async deleteAlbum(id: string): Promise<boolean> {
    return this.albums.delete(id);
  }
}

export const storage = new MemStorage();
