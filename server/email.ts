import axios from "axios";
import qs from "qs";
import type { Website } from "@shared/schema";

export interface AlertHistory {
  id: number;
  websiteName: string;
  status: "UP" | "DOWN";
  title: string;
  message: string;
  sentAt: string;
}

const alertHistory: AlertHistory[] = [];

export function getRecentAlerts() {
  return alertHistory;
}

async function sendPing(title: string, message: string) {
  const url = process.env.ALERT_WEBHOOK_URL ;
  const channelName = process.env.ALERT_CHANNEL_NAME;

  const data = qs.stringify({
    channelName,
    title: title,
    message: message,
  });

  try {
    await axios.post(url, data, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      timeout: 10000,
    });
    console.log(`[Alert] Sent ping: ${title}`);
  } catch (error: any) {
    console.error("[Alert] Failed to send ping:", error.message);
  }
}

export async function sendDowntimeAlert(website: Website, error: string) {
  const title = `🔴 DOWN: ${website.name}`;
  const message = `URL: ${website.url}\nError: ${error}\nTime: ${new Date().toLocaleString()}`;

  alertHistory.unshift({
    id: Date.now(),
    websiteName: website.name,
    status: "DOWN",
    title,
    message,
    sentAt: new Date().toISOString()
  });
  
  // Keep only last 50 alerts
  if (alertHistory.length > 50) alertHistory.pop();

  await sendPing(title, message);
}

export async function sendRecoveryAlert(website: Website) {
  const title = `🟢 UP: ${website.name}`;
  const message = `URL: ${website.url}\nRecovered at: ${new Date().toLocaleString()}`;

  alertHistory.unshift({
    id: Date.now(),
    websiteName: website.name,
    status: "UP",
    title,
    message,
    sentAt: new Date().toISOString()
  });

  if (alertHistory.length > 50) alertHistory.pop();

  await sendPing(title, message);
}
