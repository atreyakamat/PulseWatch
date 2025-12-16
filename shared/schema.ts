import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Website monitors table
export const websites = pgTable("websites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  url: text("url").notNull(),
  frequency: integer("frequency").notNull().default(5), // in minutes
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Uptime logs table
export const uptimeLogs = pgTable("uptime_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  websiteId: varchar("website_id").notNull().references(() => websites.id, { onDelete: "cascade" }),
  status: text("status").notNull(), // "UP" or "DOWN"
  responseTime: real("response_time"), // in milliseconds
  statusCode: integer("status_code"),
  errorMessage: text("error_message"),
  checkedAt: timestamp("checked_at").notNull().defaultNow(),
});

// Alert email configurations
export const alertEmails = pgTable("alert_emails", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Relations
export const websitesRelations = relations(websites, ({ many }) => ({
  logs: many(uptimeLogs),
}));

export const uptimeLogsRelations = relations(uptimeLogs, ({ one }) => ({
  website: one(websites, {
    fields: [uptimeLogs.websiteId],
    references: [websites.id],
  }),
}));

// Insert schemas
export const insertWebsiteSchema = createInsertSchema(websites).omit({
  id: true,
  createdAt: true,
}).extend({
  url: z.string().url("Please enter a valid URL"),
  name: z.string().min(1, "Name is required"),
  frequency: z.number().min(1).max(60).default(5),
});

export const insertUptimeLogSchema = createInsertSchema(uptimeLogs).omit({
  id: true,
  checkedAt: true,
});

export const insertAlertEmailSchema = createInsertSchema(alertEmails).omit({
  id: true,
  createdAt: true,
}).extend({
  email: z.string().email("Please enter a valid email"),
});

// Types
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type Website = typeof websites.$inferSelect;

export type InsertUptimeLog = z.infer<typeof insertUptimeLogSchema>;
export type UptimeLog = typeof uptimeLogs.$inferSelect;

export type InsertAlertEmail = z.infer<typeof insertAlertEmailSchema>;
export type AlertEmail = typeof alertEmails.$inferSelect;

// Legacy user types for compatibility
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
