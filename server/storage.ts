import { type User, type InsertUser, type Event, type InsertEvent, type Photo, type InsertPhoto, type Contact, type InsertContact, type MusicRecording, type InsertMusicRecording } from "@shared/schema";
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
  
  // Music Recordings
  getMusicRecordings(): Promise<MusicRecording[]>;
  getMusicRecording(id: string): Promise<MusicRecording | undefined>;
  createMusicRecording(recording: InsertMusicRecording): Promise<MusicRecording>;
  updateMusicRecording(id: string, recording: Partial<MusicRecording>): Promise<MusicRecording | undefined>;
  deleteMusicRecording(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private photos: Map<string, Photo>;
  private contacts: Map<string, Contact>;
  private musicRecordings: Map<string, MusicRecording>;

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.photos = new Map();
    this.contacts = new Map();
    this.musicRecordings = new Map();
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
      googleEventId: googleEventId || null 
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

  // Music Recordings
  async getMusicRecordings(): Promise<MusicRecording[]> {
    return Array.from(this.musicRecordings.values());
  }

  async getMusicRecording(id: string): Promise<MusicRecording | undefined> {
    return this.musicRecordings.get(id);
  }

  async createMusicRecording(insertRecording: InsertMusicRecording): Promise<MusicRecording> {
    const id = randomUUID();
    const recording: MusicRecording = { 
      ...insertRecording, 
      id,
      description: insertRecording.description ?? null,
      releaseDate: insertRecording.releaseDate ?? null,
      albumTitle: insertRecording.albumTitle ?? null,
      createdAt: new Date()
    };
    this.musicRecordings.set(id, recording);
    return recording;
  }

  async updateMusicRecording(id: string, updateData: Partial<MusicRecording>): Promise<MusicRecording | undefined> {
    const recording = this.musicRecordings.get(id);
    if (!recording) return undefined;
    
    const updatedRecording = { ...recording, ...updateData };
    this.musicRecordings.set(id, updatedRecording);
    return updatedRecording;
  }

  async deleteMusicRecording(id: string): Promise<boolean> {
    return this.musicRecordings.delete(id);
  }
}

export const storage = new MemStorage();
