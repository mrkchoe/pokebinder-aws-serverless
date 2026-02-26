"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { searchCards, toCardPayload, type PokemonTcgCard } from "@/lib/pokemon-tcg-api";
import { useDebounce } from "@/hooks/use-debounce";
import type { CardPayload } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CardSearchModalProps {
  open: boolean;
  onClose: () => void;
  onSelect: (card: CardPayload) => void;
}

export function CardSearchModal({ open, onClose, onSelect }: CardSearchModalProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PokemonTcgCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<PokemonTcgCard | null>(null);
  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    searchCards({ q: `name:*${debouncedQuery}*`, pageSize: 20 })
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Search cards</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Card name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="mb-2"
        />
        {loading && <p className="text-sm text-muted-foreground">Searching…</p>}
        <div className="flex-1 overflow-auto grid grid-cols-2 sm:grid-cols-4 gap-2 min-h-[200px]">
          {results.map((card) => (
            <button
              type="button"
              key={card.id}
              onClick={() => setSelected(card)}
              className={cn(
                "rounded border p-1 text-left transition-colors",
                selected?.id === card.id ? "border-primary ring-2 ring-primary" : "hover:bg-muted"
              )}
            >
              <img
                src={card.images.small}
                alt={card.name}
                className="w-full aspect-[2/3] object-cover rounded"
              />
              <p className="text-xs truncate mt-1">{card.name}</p>
            </button>
          ))}
        </div>
        {selected && (
          <div className="border-t pt-4 flex items-center gap-4">
            <img
              src={selected.images.large}
              alt={selected.name}
              className="w-24 aspect-[2/3] object-cover rounded"
            />
            <div className="flex-1">
              <p className="font-medium">{selected.name}</p>
              <p className="text-sm text-muted-foreground">{selected.set.name}</p>
            </div>
            <div className="flex gap-2">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                onClick={() => {
                  onSelect(toCardPayload(selected));
                  onClose();
                }}
              >
                Add to binder
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
