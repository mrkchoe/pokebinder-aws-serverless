import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

export type Db = Database.Database;

let dbInstance: Db | null = null;

function getDbPath() {
  const envPath = process.env.TCG_DB_PATH;
  if (envPath) return envPath;
  const cwd = process.cwd();
  return path.join(cwd, "data", "tcg_inventory.db");
}

export function getDb(): Db {
  if (!dbInstance) {
    const dbPath = getDbPath();
    fs.mkdirSync(path.dirname(dbPath), { recursive: true });
    dbInstance = new Database(dbPath);
    dbInstance.pragma("foreign_keys = ON");
  }
  return dbInstance;
}

export function applySchema(db: Db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      release_date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      set_id INTEGER NOT NULL,
      number TEXT NOT NULL,
      rarity TEXT NOT NULL,
      type TEXT NOT NULL,
      image_url TEXT NOT NULL,
      market_value REAL NOT NULL CHECK (market_value >= 0),
      FOREIGN KEY (set_id) REFERENCES sets(id) ON DELETE CASCADE,
      UNIQUE (set_id, number)
    );

    CREATE TABLE IF NOT EXISTS inventory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity >= 0),
      condition TEXT NOT NULL,
      acquired_at TEXT NOT NULL,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    );
  `);
}

export function clearAll(db: Db) {
  db.exec(`
    DROP TABLE IF EXISTS inventory;
    DROP TABLE IF EXISTS cards;
    DROP TABLE IF EXISTS sets;
  `);
}

