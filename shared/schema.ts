import { mysqlTable, varchar, int, boolean, timestamp, bigint } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Website monitors table
export const websites = mysqlTable("websites", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  url: varchar("url", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  frequency: int("frequency").notNull().default(5), // minutes
  enabled: boolean("enabled").default(true).notNull(),
  status: varchar("status", { length: 50 }).default("UNKNOWN"),
  lastCheck: timestamp("last_check"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Uptime logs table
export const uptimeLogs = mysqlTable("logs", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  websiteId: bigint("website_id", { mode: "number" }).notNull(),
  status: varchar("status", { length: 50 }).notNull(),
  responseTime: int("response_time").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Alert email configurations
export const alertEmails = mysqlTable("alert_emails", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  enabled: boolean("enabled").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
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

// Types
export type Website = typeof websites.$inferSelect;
export type InsertWebsite = z.infer<typeof insertWebsiteSchema>;
export type Log = typeof uptimeLogs.$inferSelect;
export type AlertEmail = typeof alertEmails.$inferSelect;
