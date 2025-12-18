import { migrate } from "drizzle-orm/mysql2/migrator";
import { db, poolConnection } from "./db";

async function main() {
  console.log("Running migrations...");
  
  // This will run migrations from the ./drizzle folder
  await migrate(db, { migrationsFolder: "./drizzle" });
  
  console.log("Migrations completed successfully!");
  
  // Close the connection so the script exits
  await poolConnection.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed!", err);
  process.exit(1);
});
