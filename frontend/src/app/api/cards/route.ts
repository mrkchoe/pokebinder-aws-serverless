import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/server/db";
import { seedDatabase } from "@/server/seed-data";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const db = getDb();
  seedDatabase(db);

  const { searchParams } = new URL(request.url);
  const search = searchParams.get("search") ?? "";
  const setId = searchParams.get("set") ?? "";
  const rarity = searchParams.get("rarity") ?? "";
  const type = searchParams.get("type") ?? "";
  const sort = searchParams.get("sort") ?? "value";

  const filters: string[] = [];
  const params: unknown[] = [];

  if (search) {
    filters.push("c.name LIKE ?");
    params.push(`%${search}%`);
  }
  if (setId) {
    filters.push("s.id = ?");
    params.push(Number(setId));
  }
  if (rarity) {
    filters.push("c.rarity = ?");
    params.push(rarity);
  }
  if (type) {
    filters.push("c.type = ?");
    params.push(type);
  }

  let orderBy = "c.market_value DESC";
  if (sort === "release_date") {
    orderBy = "s.release_date DESC, c.name ASC";
  } else if (sort === "name") {
    orderBy = "c.name ASC";
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const stmt = db.prepare(`
    SELECT
      c.id,
      c.name,
      c.set_id as setId,
      s.name as setName,
      s.release_date as releaseDate,
      c.number,
      c.rarity,
      c.type,
      c.image_url as imageUrl,
      c.market_value as marketValue,
      COALESCE(SUM(i.quantity), 0) as ownedQuantity
    FROM cards c
    JOIN sets s ON c.set_id = s.id
    LEFT JOIN inventory i ON i.card_id = c.id
    ${whereClause}
    GROUP BY c.id
    ORDER BY ${orderBy}
    LIMIT 100
  `);

  const rows = stmt.all(...params);

  return NextResponse.json({ cards: rows });
}

