import { websites, uptimeLogs, alertEmails } from "@shared/schema";
import type { Website, InsertWebsite, Log, AlertEmail } from "@shared/schema";
import { db } from "./db";
import { eq, desc, like, or, sql, and, gte } from "drizzle-orm";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  getWebsites(query?: string): Promise<Website[]>;
  getActiveWebsites(): Promise<Website[]>;
  getWebsite(id: number): Promise<Website | undefined>;
  createWebsite(website: InsertWebsite): Promise<Website>;
  updateWebsite(id: number, website: Partial<Website>): Promise<Website>;
  deleteWebsite(id: number): Promise<void>;

  logUptime(log: Omit<Log, "id" | "createdAt">): Promise<Log>;
  getLogs(limit: number): Promise<Log[]>;
  getLogsByWebsite(id: number, limit: number): Promise<Log[]>;
  
  getUptimeStats(websiteId: number): Promise<{ period: string; uptime: number }[]>;
  getAnalyticsSummary(): Promise<{ totalWebsites: number; up: number; down: number; avgResponseTime: number }>;

  getAlertEmails(): Promise<AlertEmail[]>;
  addAlertEmail(email: string): Promise<AlertEmail>;
  updateAlertEmail(id: number, enabled: boolean): Promise<AlertEmail>;
  deleteAlertEmail(id: number): Promise<void>;

  sessionStore: session.Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getWebsites(query?: string): Promise<Website[]> {
    if (query) {
      const search = `%${query}%`;
      return await db.select().from(websites)
        .where(or(like(websites.name, search), like(websites.url, search)))
        .orderBy(desc(websites.createdAt));
    }
    return await db.select().from(websites).orderBy(desc(websites.createdAt));
  }

  async getActiveWebsites(): Promise<Website[]> {
    return await db.select().from(websites)
      .where(eq(websites.enabled, true))
      .orderBy(desc(websites.createdAt));
  }

  async getWebsite(id: number): Promise<Website | undefined> {
    const [website] = await db.select().from(websites).where(eq(websites.id, id));
    return website;
  }

  async createWebsite(website: InsertWebsite): Promise<Website> {
    const [result] = await db.insert(websites).values(website);
    const [created] = await db.select().from(websites).where(eq(websites.id, result.insertId as number));
    return created;
  }

  async updateWebsite(id: number, update: Partial<Website>): Promise<Website> {
    if (Object.keys(update).length === 0) {
      const [current] = await db.select().from(websites).where(eq(websites.id, id));
      if (!current) throw new Error("Website not found");
      return current;
    }
    await db.update(websites).set(update).where(eq(websites.id, id));
    const [updated] = await db.select().from(websites).where(eq(websites.id, id));
    return updated;
  }

  async deleteWebsite(id: number): Promise<void> {
    await db.delete(websites).where(eq(websites.id, id));
  }

  async logUptime(log: Omit<Log, "id" | "createdAt">): Promise<Log> {
    const [result] = await db.insert(uptimeLogs).values(log);
    const [created] = await db.select().from(uptimeLogs).where(eq(uptimeLogs.id, result.insertId as number));
    return created;
  }

  async getLogs(limit: number): Promise<Log[]> {
    return await db.select().from(uptimeLogs).orderBy(desc(uptimeLogs.createdAt)).limit(limit);
  }

  async getLogsByWebsite(id: number, limit: number): Promise<Log[]> {
    return await db.select().from(uptimeLogs).where(eq(uptimeLogs.websiteId, id)).orderBy(desc(uptimeLogs.createdAt)).limit(limit);
  }

  async getUptimeStats(websiteId: number): Promise<{ period: string; uptime: number }[]> {
    const periods = [
      { label: "24h", hours: 24 },
      { label: "7d", hours: 24 * 7 },
      { label: "30d", hours: 24 * 30 },
    ];

    const stats = [];
    for (const period of periods) {
      const since = new Date(Date.now() - period.hours * 60 * 60 * 1000);
      const [result] = await db
        .select({
          total: sql<number>`count(*)`,
          up: sql<number>`sum(case when ${uptimeLogs.status} = 'UP' then 1 else 0 end)`,
        })
        .from(uptimeLogs)
        .where(and(eq(uptimeLogs.websiteId, websiteId), gte(uptimeLogs.createdAt, since)));

      const total = Number(result.total) || 0;
      const up = Number(result.up) || 0;
      const uptime = total === 0 ? 100 : Math.round((up / total) * 100);
      stats.push({ period: period.label, uptime });
    }
    return stats;
  }

  async getAnalyticsSummary(): Promise<{ totalWebsites: number; up: number; down: number; avgResponseTime: number }> {
    const [counts] = await db
      .select({
        total: sql<number>`count(*)`,
        up: sql<number>`sum(case when ${websites.status} = 'UP' then 1 else 0 end)`,
        down: sql<number>`sum(case when ${websites.status} = 'DOWN' then 1 else 0 end)`,
      })
      .from(websites);

    const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const [avgResp] = await db
      .select({
        avg: sql<number>`avg(${uptimeLogs.responseTime})`,
      })
      .from(uptimeLogs)
      .where(gte(uptimeLogs.createdAt, since24h));

    return {
      totalWebsites: Number(counts.total) || 0,
      up: Number(counts.up) || 0,
      down: Number(counts.down) || 0,
      avgResponseTime: Math.round(Number(avgResp.avg) || 0),
    };
  }

  async getAlertEmails(): Promise<AlertEmail[]> {
    return await db.select().from(alertEmails);
  }

  async addAlertEmail(email: string): Promise<AlertEmail> {
    const [result] = await db.insert(alertEmails).values({ email, enabled: true });
    const [created] = await db.select().from(alertEmails).where(eq(alertEmails.id, result.insertId as number));
    return created;
  }

  async updateAlertEmail(id: number, enabled: boolean): Promise<AlertEmail> {
    await db.update(alertEmails).set({ enabled }).where(eq(alertEmails.id, id));
    const [updated] = await db.select().from(alertEmails).where(eq(alertEmails.id, id));
    return updated;
  }

  async deleteAlertEmail(id: number): Promise<void> {
    await db.delete(alertEmails).where(eq(alertEmails.id, id));
  }
}

export const storage = new DatabaseStorage();
