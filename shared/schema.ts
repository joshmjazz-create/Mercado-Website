import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  venue: text("venue").notNull(),
  address: text("address"),
  ticketPrice: text("ticket_price"),
  ticketUrl: text("ticket_url"),
  googleEventId: text("google_event_id"),
  color: text("color").default("default"),
});

export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  googlePhotoId: text("google_photo_id"),
  takenAt: timestamp("taken_at"),
  order: integer("order").default(0),
});

export const contacts = pgTable("contacts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  eventType: text("event_type"),
  eventDate: text("event_date"),
  message: text("message"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const albums = pgTable("albums", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  artist: text("artist").notNull(),
  description: text("description"),
  coverImageUrl: text("cover_image_url").notNull(),
  spotifyUrl: text("spotify_url"),
  appleMusicUrl: text("apple_music_url"),
  youtubeUrl: text("youtube_url"),
  releaseDate: text("release_date"),
  category: text("category").notNull().default("original"), // "original", "featured", "upcoming"
  audioPreviewUrl: text("audio_preview_url"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertEventSchema = createInsertSchema(events).omit({
  id: true,
  googleEventId: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  googlePhotoId: true,
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertAlbumSchema = createInsertSchema(albums).omit({
  id: true,
  createdAt: true,
});

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type Photo = typeof photos.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;

export type Album = typeof albums.$inferSelect;
export type InsertAlbum = z.infer<typeof insertAlbumSchema>;

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
