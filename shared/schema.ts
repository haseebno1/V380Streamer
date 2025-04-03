import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table (basic authentication)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Camera configuration table
export const cameras = pgTable("cameras", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  rtspUrl: text("rtsp_url").notNull(),
  username: text("username"),
  password: text("password"),
  streamQuality: text("stream_quality").default("medium"), // high, medium, low
  autoConnect: boolean("auto_connect").default(false),
  autoRecord: boolean("auto_record").default(false),
  isOnline: boolean("is_online").default(false),
  isRecording: boolean("is_recording").default(false),
  lastConnected: timestamp("last_connected"),
});

export const insertCameraSchema = createInsertSchema(cameras).omit({
  id: true,
  isOnline: true,
  isRecording: true,
  lastConnected: true,
});

// Recordings table
export const recordings = pgTable("recordings", {
  id: serial("id").primaryKey(),
  cameraId: integer("camera_id").notNull(),
  filename: text("filename").notNull(),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  filesize: integer("filesize"),
  filepath: text("filepath").notNull(),
});

export const insertRecordingSchema = createInsertSchema(recordings).omit({
  id: true,
  endTime: true,
  filesize: true,
});

// Type definitions
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCamera = z.infer<typeof insertCameraSchema>;
export type Camera = typeof cameras.$inferSelect;

export type InsertRecording = z.infer<typeof insertRecordingSchema>;
export type Recording = typeof recordings.$inferSelect;

// Stream quality options
export const streamQualityOptions = [
  { value: "high", label: "HD (1080p)" },
  { value: "medium", label: "SD (720p)" },
  { value: "low", label: "Low (480p)" },
];

// Get resolution based on quality
export function getResolution(quality: string): { width: number, height: number } {
  switch (quality) {
    case "high":
      return { width: 1920, height: 1080 };
    case "medium":
      return { width: 1280, height: 720 };
    case "low":
      return { width: 854, height: 480 };
    default:
      return { width: 1280, height: 720 };
  }
}
