import { getDb } from "../src/server/db";
import { seedDatabase } from "../src/server/seed-data";

async function main() {
  const db = getDb();
  seedDatabase(db);
  // eslint-disable-next-line no-console
  console.log("Database seeded with sample TCG inventory data.");
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

