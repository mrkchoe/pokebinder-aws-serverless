"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useDebounce } from "@/hooks/use-debounce";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CardSummary {
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

interface FilterSetsResponse {
  sets: { id: number; name: string; releaseDate: string }[];
  rarities: string[];
  types: string[];
}

export default function CardsPage() {
  const [cards, setCards] = useState<CardSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [setFilter, setSetFilter] = useState("");
  const [rarityFilter, setRarityFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [sort, setSort] = useState<"value" | "release_date" | "name">("value");
  const [filters, setFilters] = useState<FilterSetsResponse | null>(null);

  const debouncedSearch = useDebounce(search, 250);

  useEffect(() => {
    async function loadFilters() {
      const res = await fetch("/api/filters");
      const data = (await res.json()) as FilterSetsResponse;
      setFilters(data);
    }
    loadFilters();
  }, []);

  useEffect(() => {
    async function loadCards() {
      setLoading(true);
      const params = new URLSearchParams();
      if (debouncedSearch) params.set("search", debouncedSearch);
      if (setFilter) params.set("set", setFilter);
      if (rarityFilter) params.set("rarity", rarityFilter);
      if (typeFilter) params.set("type", typeFilter);
      if (sort) params.set("sort", sort);
      const res = await fetch(`/api/cards?${params.toString()}`);
      const data = (await res.json()) as { cards: CardSummary[] };
      setCards(data.cards);
      setLoading(false);
    }
    loadCards();
  }, [debouncedSearch, setFilter, rarityFilter, typeFilter, sort]);

  return (
    <main className="min-h-screen px-6 py-8 bg-background">
      <div className="max-w-6xl mx-auto space-y-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              TCG Inventory Binder
            </h1>
            <p className="text-muted-foreground">
              Browse your collection, filter by set, rarity, and type, and see
              owned quantities at a glance.
            </p>
          </div>
          <Button asChild variant="outline">
            <Link href="/">Back to landing</Link>
          </Button>
        </header>

        <section className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="space-y-3">
            <Input
              placeholder="Search cards by name…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div className="flex flex-wrap gap-3">
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={setFilter}
                onChange={(e) => setSetFilter(e.target.value)}
              >
                <option value="">All sets</option>
                {filters?.sets.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={rarityFilter}
                onChange={(e) => setRarityFilter(e.target.value)}
              >
                <option value="">All rarities</option>
                {filters?.rarities.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                className="h-9 rounded-md border bg-background px-2 text-sm"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All types</option>
                {filters?.types.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-end justify-end gap-2">
            <label className="text-sm text-muted-foreground">
              Sort by
              <select
                className="ml-2 h-9 rounded-md border bg-background px-2 text-sm"
                value={sort}
                onChange={(e) =>
                  setSort(e.target.value as "value" | "release_date" | "name")
                }
              >
                <option value="value">Market value (high → low)</option>
                <option value="release_date">Release date (new → old)</option>
                <option value="name">Name (A → Z)</option>
              </select>
            </label>
          </div>
        </section>

        <section className="mt-4">
          {loading ? (
            <p className="text-sm text-muted-foreground">Loading cards…</p>
          ) : cards.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No cards match your filters.
            </p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {cards.map((card) => (
                <Card key={card.id} className="overflow-hidden">
                  <Link href={`/cards/${card.id}`}>
                    <div className="aspect-[2/3] bg-muted">
                      <img
                        src={card.imageUrl}
                        alt={card.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardHeader className="space-y-1 pb-2">
                      <CardTitle className="line-clamp-1 text-base">
                        {card.name}
                      </CardTitle>
                      <p className="text-xs text-muted-foreground">
                        {card.setName} • #{card.number}
                      </p>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Rarity: {card.rarity}</span>
                      <span>Type: {card.type}</span>
                    </CardContent>
                    <CardContent className="flex items-center justify-between pt-0 text-xs">
                      <span className="font-medium">
                        ${card.marketValue.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">
                        Owned: {card.ownedQuantity}
                      </span>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

