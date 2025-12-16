import nodemailer from "nodemailer";
import { storage } from "./storage";
import type { Website } from "@shared/schema";

// Create a test transporter (logs to console in development)
// In production, configure with real SMTP settings via environment variables
const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }
  
  // Development mode: just log emails
  return null;
};

const transporter = createTransporter();

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  if (!transporter) {
    console.log(`[Email] (Development Mode) Would send to: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Content: ${html}`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || "noreply@pulsewatch.io",
      to,
      subject,
      html,
    });
    console.log(`[Email] Sent to ${to}: ${subject}`);
  } catch (error) {
    console.error(`[Email] Failed to send to ${to}:`, error);
  }
}

export async function sendDowntimeAlert(website: Website, errorMessage: string): Promise<void> {
  const emails = await storage.getEnabledAlertEmails();
  
  if (emails.length === 0) {
    console.log(`[Email] No alert emails configured for downtime notification`);
    return;
  }

  const subject = `🚨 Website Down Alert: ${website.name}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #ef4444;">Website Down Alert</h2>
      <p>One of your monitored websites is experiencing issues:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Website:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${website.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">URL:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <a href="${website.url}">${website.url}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Status:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #ef4444;">DOWN</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Error:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${errorMessage}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Time:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date().toISOString()}</td>
        </tr>
      </table>
      <p style="color: #666; font-size: 12px;">
        This alert was sent by PulseWatch. You'll receive a recovery notification when the site comes back online.
      </p>
    </div>
  `;

  for (const email of emails) {
    await sendEmail(email.email, subject, html);
  }
}

export async function sendRecoveryAlert(website: Website): Promise<void> {
  const emails = await storage.getEnabledAlertEmails();
  
  if (emails.length === 0) {
    return;
  }

  const subject = `✅ Website Recovered: ${website.name}`;
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #22c55e;">Website Recovered</h2>
      <p>Good news! Your monitored website is back online:</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Website:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${website.name}</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">URL:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">
            <a href="${website.url}">${website.url}</a>
          </td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Status:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee; color: #22c55e;">UP</td>
        </tr>
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #eee; font-weight: bold;">Recovered At:</td>
          <td style="padding: 10px; border-bottom: 1px solid #eee;">${new Date().toISOString()}</td>
        </tr>
      </table>
      <p style="color: #666; font-size: 12px;">
        This notification was sent by PulseWatch.
      </p>
    </div>
  `;

  for (const email of emails) {
    await sendEmail(email.email, subject, html);
  }
}
