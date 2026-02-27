"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card as UiCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface InventoryRow {
  id: number;
  quantity: number;
  condition: string;
  acquiredAt: string;
}

interface CardDetail {
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

export default function CardDetailPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const [card, setCard] = useState<CardDetail | null>(null);
  const [inventory, setInventory] = useState<InventoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCard() {
      try {
        const res = await fetch(`/api/cards/${id}`);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error((data as { error?: string }).error ?? "Failed to load card");
        }
        const data = (await res.json()) as {
          card: CardDetail;
          inventory: InventoryRow[];
        };
        setCard(data.card);
        setInventory(data.inventory);
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadCard();
    }
  }, [id]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading card…</p>
      </main>
    );
  }

  if (error || !card) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-destructive">
          {error ?? "Card not found."}
        </p>
        <Button asChild variant="outline">
          <Link href="/cards">Back to cards</Link>
        </Button>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8 bg-background">
      <div className="max-w-5xl mx-auto grid gap-8 md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="space-y-4">
          <UiCard className="overflow-hidden">
            <div className="aspect-[2/3] bg-muted">
              <img
                src={card.imageUrl}
                alt={card.name}
                className="h-full w-full object-cover"
              />
            </div>
          </UiCard>
          <Button asChild variant="outline" className="w-full">
            <Link href="/cards">Back to binder</Link>
          </Button>
        </div>

        <UiCard>
          <CardHeader>
            <CardTitle className="text-2xl">{card.name}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {card.setName} • #{card.number}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Rarity</p>
                <p>{card.rarity}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p>{card.type}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Release date</p>
                <p>{new Date(card.releaseDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Market value</p>
                <p>${card.marketValue.toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h2 className="text-sm font-semibold mb-2">Owned quantity</h2>
              <p className="text-2xl font-bold">
                {card.ownedQuantity}{" "}
                <span className="text-sm font-normal text-muted-foreground">
                  copies
                </span>
              </p>
            </div>

            {inventory.length > 0 && (
              <div className="border-t pt-4 space-y-2">
                <h3 className="text-sm font-semibold">Inventory lots</h3>
                <ul className="space-y-1 text-sm">
                  {inventory.map((entry) => (
                    <li
                      key={entry.id}
                      className="flex items-center justify-between"
                    >
                      <span>
                        {entry.quantity}x • {entry.condition}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(entry.acquiredAt).toLocaleDateString()}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </UiCard>
      </div>
    </main>
  );
}

