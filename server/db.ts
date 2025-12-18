import "dotenv/config";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

// Parse the connection string to handle SSL and other options explicitly
const dbUrl = new URL(process.env.DATABASE_URL);
const params = {
  host: dbUrl.hostname,
  user: decodeURIComponent(dbUrl.username),
  password: decodeURIComponent(dbUrl.password), // Explicitly decode to handle %40, %7C, etc.
  database: dbUrl.pathname.slice(1), // Remove leading slash
  port: Number(dbUrl.port) || 3306,
  ssl: {
    rejectUnauthorized: false, // Allow self-signed certs common in shared hosting
  },
  connectTimeout: 20000,
};

export const poolConnection = mysql.createPool(params);

export const db = drizzle(poolConnection, { schema, mode: "default" });
