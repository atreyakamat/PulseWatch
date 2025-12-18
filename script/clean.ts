import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Resolve path to the drizzle folder in the root
const drizzleDir = path.resolve(__dirname, "..", "drizzle");

if (fs.existsSync(drizzleDir)) {
  console.log(`Cleaning corrupted migration folder: ${drizzleDir}...`);
  fs.rmSync(drizzleDir, { recursive: true, force: true });
  console.log("Successfully removed drizzle folder.");
} else {
  console.log("Drizzle folder not found, nothing to clean.");
}
