import { NextResponse } from "next/server";
import { getDb } from "@/server/db";
import { seedDatabase } from "@/server/seed-data";

export const runtime = "nodejs";

export async function GET() {
  const db = getDb();
  seedDatabase(db);

  const sets = db
    .prepare(
      "SELECT id, name, release_date as releaseDate FROM sets ORDER BY release_date DESC, name ASC"
    )
    .all();

  const rarities = db
    .prepare("SELECT DISTINCT rarity FROM cards ORDER BY rarity ASC")
    .all()
    .map((r: { rarity: string }) => r.rarity);

  const types = db
    .prepare("SELECT DISTINCT type FROM cards ORDER BY type ASC")
    .all()
    .map((t: { type: string }) => t.type);

  return NextResponse.json({ sets, rarities, types });
}

