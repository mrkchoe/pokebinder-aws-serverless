import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/server/db";
import { seedDatabase } from "@/server/seed-data";

export const runtime = "nodejs";

export async function GET(
  _request: NextRequest,
  context: { params: { id: string } }
) {
  const db = getDb();
  seedDatabase(db);

  const id = Number(context.params.id);
  if (Number.isNaN(id)) {
    return NextResponse.json({ error: "Invalid card id" }, { status: 400 });
  }

  const card = db
    .prepare(
      `
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
      WHERE c.id = ?
      GROUP BY c.id
    `
    )
    .get(id) as
    | {
        id: number;
        name: string;
        setId: number;
        setName: string;
        releaseDate: string;
        number: string;
        rarity: string;
        type: string;
        imageUrl: string;
        marketValue: number;
        ownedQuantity: number;
      }
    | undefined;

  if (!card) {
    return NextResponse.json({ error: "Card not found" }, { status: 404 });
  }

  const inventory = db
    .prepare(
      `
      SELECT
        id,
        quantity,
        condition,
        acquired_at as acquiredAt
      FROM inventory
      WHERE card_id = ?
      ORDER BY acquired_at DESC
    `
    )
    .all(id);

  return NextResponse.json({ card, inventory });
}

