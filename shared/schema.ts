import { sql } from "drizzle-orm";
import { pgTable, text, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Website monitors table
export const websites = pgTable("websites", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  url: text("url").notNull(),
  name: text("name").notNull(),
  frequency: integer("frequency").notNull().default(5), // in minutes
  enabled: boolean("enabled").notNull().default(true),
  status: text("status").default("UNKNOWN"),
  lastCheck: timestamp("last_check"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Uptime logs table
export const uptimeLogs = pgTable("logs", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  websiteId: integer("website_id").notNull(),
  status: text("status").notNull(), // "UP" or "DOWN"
  responseTime: integer("response_time").notNull(), // in milliseconds
  createdAt: timestamp("created_at").defaultNow(),
});

// Alert email configurations
export const alertEmails = pgTable("alert_emails", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  email: text("email").notNull().unique(),
  enabled: boolean("enabled").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Users table
export const users = pgTable("users", {
  id: integer("id").generatedAlwaysAsIdentity().primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

// Insert schemas
export const insertWebsiteSchema = createInsertSchema(websites).pick({
  url: true,
  name: true,
  frequency: true,
  enabled: true,
});

export const insertAlertEmailSchema = createInsertSchema(alertEmails).pick({
  email: true,
});

export const insertUserSchema = createInsertSchema(users);

// Types
export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type Log = typeof uptimeLogs.$inferSelect;
export type AlertEmail = typeof alertEmails.$inferSelect;
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
