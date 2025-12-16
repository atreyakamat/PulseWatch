import cron, { type ScheduledTask } from "node-cron";
import axios from "axios";
import { storage } from "./storage";
import { sendDowntimeAlert, sendRecoveryAlert } from "./email";
import type { Website } from "@shared/schema";

const activeJobs = new Map<string, ScheduledTask>();
const lastStatus = new Map<string, string>();
const alertCooldown = new Map<string, number>();

const ALERT_COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes cooldown between alerts

async function checkWebsite(website: Website): Promise<void> {
  const startTime = Date.now();
  let status: "UP" | "DOWN" = "DOWN";
  let responseTime: number | null = null;
  let statusCode: number | null = null;
  let errorMessage: string | null = null;

  try {
    const response = await axios.get(website.url, {
      timeout: 10000, // 10 second timeout
      validateStatus: () => true, // Accept any status code
      maxRedirects: 5,
      headers: {
        'User-Agent': 'PulseWatch/1.0 Uptime Monitor',
      },
    });

    responseTime = Date.now() - startTime;
    statusCode = response.status;

    // Consider 2xx and 3xx status codes as UP
    if (statusCode >= 200 && statusCode < 400) {
      status = "UP";
    } else {
      status = "DOWN";
      errorMessage = `HTTP ${statusCode}`;
    }
  } catch (error: any) {
    responseTime = Date.now() - startTime;
    status = "DOWN";
    
    if (error.code === "ECONNREFUSED") {
      errorMessage = "Connection refused";
    } else if (error.code === "ENOTFOUND") {
      errorMessage = "DNS lookup failed";
    } else if (error.code === "ETIMEDOUT" || error.message?.includes("timeout")) {
      errorMessage = "Request timeout";
    } else if (error.code === "ECONNRESET") {
      errorMessage = "Connection reset";
    } else if (error.code === "CERT_HAS_EXPIRED") {
      errorMessage = "SSL certificate expired";
    } else {
      errorMessage = error.message || "Unknown error";
    }
  }

  // Log the check
  await storage.createLog({
    websiteId: website.id,
    status,
    responseTime,
    statusCode,
    errorMessage,
  });

  // Handle status changes for alerts
  const previousStatus = lastStatus.get(website.id);
  lastStatus.set(website.id, status);

  if (status === "DOWN" && previousStatus !== "DOWN") {
    // Site just went down
    const lastAlert = alertCooldown.get(website.id) || 0;
    const now = Date.now();

    if (now - lastAlert > ALERT_COOLDOWN_MS) {
      alertCooldown.set(website.id, now);
      await sendDowntimeAlert(website, errorMessage || "Unknown error");
    }
  } else if (status === "UP" && previousStatus === "DOWN") {
    // Site recovered
    await sendRecoveryAlert(website);
  }

  console.log(`[Monitor] ${website.name} (${website.url}): ${status} - ${responseTime}ms`);
}

function getCronExpression(frequency: number): string {
  if (frequency === 1) {
    return "* * * * *"; // Every minute
  }
  return `*/${frequency} * * * *`; // Every N minutes
}

export function startMonitor(website: Website): void {
  // Stop existing job if any
  stopMonitor(website.id);

  if (!website.isActive) {
    return;
  }

  const cronExpression = getCronExpression(website.frequency);
  
  const job = cron.schedule(cronExpression, () => {
    checkWebsite(website).catch(err => {
      console.error(`[Monitor] Error checking ${website.name}:`, err);
    });
  });

  activeJobs.set(website.id, job);
  console.log(`[Monitor] Started monitoring ${website.name} every ${website.frequency} minutes`);

  // Run initial check immediately
  checkWebsite(website).catch(err => {
    console.error(`[Monitor] Error in initial check for ${website.name}:`, err);
  });
}

export function stopMonitor(websiteId: string): void {
  const job = activeJobs.get(websiteId);
  if (job) {
    job.stop();
    activeJobs.delete(websiteId);
    lastStatus.delete(websiteId);
    console.log(`[Monitor] Stopped monitoring website ${websiteId}`);
  }
}

export async function initializeMonitors(): Promise<void> {
  console.log("[Monitor] Initializing monitoring engine...");
  
  try {
    const websites = await storage.getActiveWebsites();
    
    for (const website of websites) {
      startMonitor(website);
    }

    console.log(`[Monitor] Started monitoring ${websites.length} active websites`);
  } catch (error) {
    console.error("[Monitor] Failed to initialize monitors:", error);
  }
}

export function restartMonitor(website: Website): void {
  startMonitor(website);
}
