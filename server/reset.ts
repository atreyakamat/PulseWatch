import { poolConnection } from "./db";

async function main() {
  console.log("Resetting database...");
  
  // Disable foreign key checks to allow dropping tables in any order
  await poolConnection.query("SET FOREIGN_KEY_CHECKS = 0");

  const tables = ["websites", "logs", "alert_emails", "__drizzle_migrations"];
  
  for (const table of tables) {
    try {
      await poolConnection.query(`DROP TABLE IF EXISTS \`${table}\``);
      console.log(`Dropped table ${table}`);
    } catch (e: any) {
      console.error(`Failed to drop ${table}: ${e.message}`);
    }
  }

  await poolConnection.query("SET FOREIGN_KEY_CHECKS = 1");
  console.log("Database reset complete.");
  
  await poolConnection.end();
  process.exit(0);
}

main().catch((err) => {
  console.error("Reset failed!", err);
  process.exit(1);
});
