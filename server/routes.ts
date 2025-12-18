import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertWebsiteSchema, insertAlertEmailSchema } from "@shared/schema";
import { z } from "zod";
import { startMonitor, stopMonitor, restartMonitor, initializeMonitors } from "./monitor";
import { setupAuth } from "./auth";
import { getRecentAlerts } from "./email";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Initialize authentication (still useful for login UI, but we won't block API)
  setupAuth(app);

  // Initialize monitors when server starts
  initializeMonitors().catch(err => {
    console.error("Failed to initialize monitors:", err);
  });

  // Seed default alert email if none exist
  storage.getAlertEmails().then(async (emails) => {
    if (emails.length === 0) {
      console.log("Seeding default alert email...");
      try {
        await storage.addAlertEmail("admin@example.com");
      } catch (e) {
        console.error("Failed to seed email:", e);
      }
    }
  });

  // === Website Routes ===

  // Get all websites
  app.get("/api/websites", async (req, res) => {
    try {
      const websites = await storage.getWebsites();
      res.json(websites);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single website
  app.get("/api/websites/:id", async (req, res) => {
    try {
      const website = await storage.getWebsite(parseInt(req.params.id));
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }
      res.json(website);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create website (NO AUTH CHECK)
  app.post("/api/websites", async (req, res) => {
    try {
      const data = insertWebsiteSchema.parse(req.body);
      const website = await storage.createWebsite(data);
      
      // Start monitoring the new website
      startMonitor(website);
      
      res.status(201).json(website);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Bulk create websites (NO AUTH CHECK)
  app.post("/api/websites/bulk", async (req, res) => {
    try {
      const { websites } = req.body;
      
      if (!Array.isArray(websites)) {
        return res.status(400).json({ error: "websites must be an array" });
      }

      const created = [];
      for (const websiteData of websites) {
        try {
          const data = insertWebsiteSchema.parse(websiteData);
          const website = await storage.createWebsite(data);
          startMonitor(website);
          created.push(website);
        } catch (error) {
          console.error("Failed to create website:", websiteData, error);
        }
      }

      res.status(201).json(created);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Update website (NO AUTH CHECK)
  app.patch("/api/websites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Handle legacy isActive field if present (map to enabled)
      const rawUpdate = { ...req.body };
      if (rawUpdate.isActive !== undefined && rawUpdate.enabled === undefined) {
        rawUpdate.enabled = rawUpdate.isActive;
      }

      // Validate against schema (partial update)
      const updateData = insertWebsiteSchema.partial().parse(rawUpdate);

      const website = await storage.updateWebsite(id, updateData);
      if (!website) {
        return res.status(404).json({ error: "Website not found" });
      }

      // Restart monitor with updated settings
      if (website.enabled) {
        restartMonitor(website);
      } else {
        stopMonitor(website.id);
      }

      res.json(website);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Delete website (NO AUTH CHECK)
  app.delete("/api/websites/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      stopMonitor(id);
      await storage.deleteWebsite(id);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // === Logs Routes ===

  // Get all logs
  app.get("/api/logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 1000;
      const websiteId = req.query.websiteId as string | undefined;

      let logs;
      if (websiteId) {
        logs = await storage.getLogsByWebsite(parseInt(websiteId), limit);
      } else {
        logs = await storage.getLogs(limit);
      }

      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get logs by website
  app.get("/api/logs/:websiteId", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getLogsByWebsite(parseInt(req.params.websiteId), limit);
      res.json(logs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // === Analytics Routes ===

  // Get uptime analytics for a website
  app.get("/api/analytics/uptime/:websiteId", async (req, res) => {
    try {
      const websiteId = parseInt(req.params.websiteId);
      const logs = await storage.getLogsByWebsite(websiteId, 1000);
      
      const now = new Date();
      const periods = {
        "24h": new Date(now.getTime() - 24 * 60 * 60 * 1000),
        "7d": new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        "30d": new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      };

      const analytics: Record<string, number> = {};

      for (const [period, since] of Object.entries(periods)) {
        const periodLogs = logs.filter(log => new Date(log.createdAt!) >= since);
        if (periodLogs.length > 0) {
          const upCount = periodLogs.filter(log => log.status === "UP").length;
          analytics[period] = (upCount / periodLogs.length) * 100;
        } else {
          analytics[period] = 0;
        }
      }

      res.json(analytics);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get summary analytics
  app.get("/api/analytics/summary", async (req, res) => {
    try {
      const websites = await storage.getWebsites();
      const logs = await storage.getLogs(10000);
      
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const recentLogs = logs.filter(log => new Date(log.createdAt!) >= last24h);
      
      let operational = 0;
      let down = 0;
      
      for (const website of websites) {
        if (!website.enabled) continue;
        
        const siteLogs = await storage.getLogsByWebsite(website.id, 1);
        const latestLog = siteLogs[0];

        if (latestLog?.status === "UP") {
          operational++;
        } else if (latestLog?.status === "DOWN") {
          down++;
        }
      }

      const avgResponseTime = recentLogs.length > 0
        ? recentLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / recentLogs.length
        : 0;

      res.json({
        total: websites.length,
        operational,
        down,
        avgResponseTime: Math.round(avgResponseTime),
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // === Alert Email Routes ===

  // Get all alert emails
  app.get("/api/alerts/emails", async (req, res) => {
    try {
      const emails = await storage.getAlertEmails();
      res.json(emails);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get recent alert messages (pings)
  app.get("/api/alerts/recent", async (_req, res) => {
    try {
      res.json(getRecentAlerts());
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Create alert email (NO AUTH CHECK)
  app.post("/api/alerts/emails", async (req, res) => {
    try {
      const data = insertAlertEmailSchema.parse(req.body);
      const email = await storage.createAlertEmail(data);
      res.status(201).json(email);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors[0].message });
      }
      if (error.code === "23505") {
        return res.status(400).json({ error: "This email is already configured" });
      }
      res.status(500).json({ error: error.message });
    }
  });

  // Update alert email (NO AUTH CHECK)
  app.patch("/api/alerts/emails/:id", async (req, res) => {
    try {
      const email = await storage.updateAlertEmail(parseInt(req.params.id), req.body);
      if (!email) {
        return res.status(404).json({ error: "Email not found" });
      }
      res.json(email);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Delete alert email (NO AUTH CHECK)
  app.delete("/api/alerts/emails/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteAlertEmail(parseInt(req.params.id));
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  return httpServer;
}
