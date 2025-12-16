import { 
  websites, 
  uptimeLogs, 
  alertEmails,
  users,
  type Website, 
  type InsertWebsite,
  type UptimeLog,
  type InsertUptimeLog,
  type AlertEmail,
  type InsertAlertEmail,
  type User,
  type InsertUser,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte } from "drizzle-orm";

export interface IStorage {
  // Users (legacy)
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Websites
  getWebsites(): Promise<Website[]>;
  getWebsite(id: string): Promise<Website | undefined>;
  createWebsite(website: InsertWebsite): Promise<Website>;
  updateWebsite(id: string, data: Partial<InsertWebsite>): Promise<Website | undefined>;
  deleteWebsite(id: string): Promise<boolean>;
  getActiveWebsites(): Promise<Website[]>;
  
  // Uptime Logs
  getLogs(limit?: number): Promise<UptimeLog[]>;
  getLogsByWebsite(websiteId: string, limit?: number): Promise<UptimeLog[]>;
  getLogsSince(since: Date): Promise<UptimeLog[]>;
  createLog(log: InsertUptimeLog): Promise<UptimeLog>;
  getLatestLogByWebsite(websiteId: string): Promise<UptimeLog | undefined>;
  
  // Alert Emails
  getAlertEmails(): Promise<AlertEmail[]>;
  getEnabledAlertEmails(): Promise<AlertEmail[]>;
  createAlertEmail(email: InsertAlertEmail): Promise<AlertEmail>;
  updateAlertEmail(id: string, data: Partial<InsertAlertEmail>): Promise<AlertEmail | undefined>;
  deleteAlertEmail(id: string): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Websites
  async getWebsites(): Promise<Website[]> {
    return db.select().from(websites).orderBy(desc(websites.createdAt));
  }

  async getWebsite(id: string): Promise<Website | undefined> {
    const [website] = await db.select().from(websites).where(eq(websites.id, id));
    return website || undefined;
  }

  async createWebsite(website: InsertWebsite): Promise<Website> {
    const [created] = await db.insert(websites).values(website).returning();
    return created;
  }

  async updateWebsite(id: string, data: Partial<InsertWebsite>): Promise<Website | undefined> {
    const [updated] = await db
      .update(websites)
      .set(data)
      .where(eq(websites.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteWebsite(id: string): Promise<boolean> {
    const result = await db.delete(websites).where(eq(websites.id, id)).returning();
    return result.length > 0;
  }

  async getActiveWebsites(): Promise<Website[]> {
    return db.select().from(websites).where(eq(websites.isActive, true));
  }

  // Uptime Logs
  async getLogs(limit = 1000): Promise<UptimeLog[]> {
    return db
      .select()
      .from(uptimeLogs)
      .orderBy(desc(uptimeLogs.checkedAt))
      .limit(limit);
  }

  async getLogsByWebsite(websiteId: string, limit = 100): Promise<UptimeLog[]> {
    return db
      .select()
      .from(uptimeLogs)
      .where(eq(uptimeLogs.websiteId, websiteId))
      .orderBy(desc(uptimeLogs.checkedAt))
      .limit(limit);
  }

  async getLogsSince(since: Date): Promise<UptimeLog[]> {
    return db
      .select()
      .from(uptimeLogs)
      .where(gte(uptimeLogs.checkedAt, since))
      .orderBy(desc(uptimeLogs.checkedAt));
  }

  async createLog(log: InsertUptimeLog): Promise<UptimeLog> {
    const [created] = await db.insert(uptimeLogs).values(log).returning();
    return created;
  }

  async getLatestLogByWebsite(websiteId: string): Promise<UptimeLog | undefined> {
    const [log] = await db
      .select()
      .from(uptimeLogs)
      .where(eq(uptimeLogs.websiteId, websiteId))
      .orderBy(desc(uptimeLogs.checkedAt))
      .limit(1);
    return log || undefined;
  }

  // Alert Emails
  async getAlertEmails(): Promise<AlertEmail[]> {
    return db.select().from(alertEmails).orderBy(desc(alertEmails.createdAt));
  }

  async getEnabledAlertEmails(): Promise<AlertEmail[]> {
    return db.select().from(alertEmails).where(eq(alertEmails.isEnabled, true));
  }

  async createAlertEmail(email: InsertAlertEmail): Promise<AlertEmail> {
    const [created] = await db.insert(alertEmails).values(email).returning();
    return created;
  }

  async updateAlertEmail(id: string, data: Partial<InsertAlertEmail>): Promise<AlertEmail | undefined> {
    const [updated] = await db
      .update(alertEmails)
      .set(data)
      .where(eq(alertEmails.id, id))
      .returning();
    return updated || undefined;
  }

  async deleteAlertEmail(id: string): Promise<boolean> {
    const result = await db.delete(alertEmails).where(eq(alertEmails.id, id)).returning();
    return result.length > 0;
  }
}

export const storage = new DatabaseStorage();
