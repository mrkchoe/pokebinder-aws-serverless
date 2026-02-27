import fs from "fs";
import path from "path";
import { getDb } from "../src/server/db";
import { clearAll } from "../src/server/db";
import { seedDatabase } from "../src/server/seed-data";

function getDbPath() {
  const envPath = process.env.TCG_DB_PATH;
  if (envPath) return envPath;
  const cwd = process.cwd();
  return path.join(cwd, "data", "tcg_inventory.db");
}

async function main() {
  const dbPath = getDbPath();
  if (fs.existsSync(dbPath)) {
    fs.unlinkSync(dbPath);
  }
  const db = getDb();
  clearAll(db);
  seedDatabase(db);
  // eslint-disable-next-line no-console
  console.log("Database reset and seeded.");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

