"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import {
  bindersApi,
  pagesApi,
  slotsApi,
  type Binder,
  type Page,
  type Slot,
  type CardPayload,
} from "@/lib/api";
import { SlotGrid } from "./slot-grid";
import { CardSearchModal } from "./card-search-modal";
import { Button } from "@/components/ui/button";

interface BinderViewProps {
  binderId: string;
}

export function BinderView({ binderId }: BinderViewProps) {
  const [binder, setBinder] = useState<Binder | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTargetPosition, setSearchTargetPosition] = useState<number | null>(null);
  const [undoState, setUndoState] = useState<{
    pageId: string;
    position: number;
    previousCard: CardPayload | null;
  } | null>(null);

  const currentPage = pages.find((p) => p.pageIndex === currentPageIndex) ?? pages[0];

  const loadBinder = useCallback(async () => {
    try {
      const [b, pList] = await Promise.all([
        bindersApi.get(binderId),
        bindersApi.listPages(binderId),
      ]);
      setBinder(b);
      let pageList = pList.pages;
      if (pageList.length === 0) {
        const newPage = await pagesApi.create(binderId, 0);
        pageList = [newPage];
      }
      setPages(pageList.sort((a, b) => a.pageIndex - b.pageIndex));
      if (currentPageIndex >= pageList.length) setCurrentPageIndex(0);
    } catch {
      setBinder(null);
      setPages([]);
    } finally {
      setLoading(false);
    }
  }, [binderId, currentPageIndex]);

  useEffect(() => {
    loadBinder();
  }, [loadBinder]);

  useEffect(() => {
    if (!currentPage) {
      setSlots([]);
      return;
    }
    slotsApi
      .list(currentPage.pageId)
      .then((r) => setSlots(r.slots))
      .catch(() => setSlots([]));
  }, [currentPage?.pageId]);

  const slotsByPosition = (): (Slot | null)[] => {
    const byPos: (Slot | null)[] = Array(9).fill(null);
    for (const s of slots) {
      if (s.position >= 0 && s.position <= 8) byPos[s.position] = s;
    }
    return byPos;
  };

  const applySlotUpdate = useCallback(
    async (pageId: string, position: number, card: CardPayload | null) => {
      if (!currentPage || currentPage.pageId !== pageId) return;
      const previous = slots.find((s) => s.position === position)?.card ?? null;
      setUndoState({ pageId, position, previousCard: previous });
      if (card === null) {
        setSlots((prev) => prev.filter((s) => s.position !== position));
        await slotsApi.undo(pageId, position, null);
        return;
      }
      try {
        const updated = await slotsApi.put(pageId, position, card);
        setSlots((prev) => {
          const next = prev.filter((s) => s.position !== position);
          next.push(updated);
          return next;
        });
      } catch {
        setSlots((prev) => prev);
      }
    },
    [currentPage, slots]
  );

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;
      const fromPos = Number(active.id);
      const toPos = Number(over.id);
      if (Number.isNaN(fromPos) || Number.isNaN(toPos) || !currentPage) return;
      const fromSlot = slots.find((s) => s.position === fromPos);
      const toSlot = slots.find((s) => s.position === toPos);
      const pageId = currentPage.pageId;
      if (fromSlot?.card) {
        const previousTo = toSlot?.card ?? null;
        setUndoState({ pageId, position: toPos, previousCard: previousTo });
        try {
          await slotsApi.put(pageId, toPos, fromSlot.card);
          if (toSlot?.card) {
            await slotsApi.put(pageId, fromPos, toSlot.card);
          } else {
            await slotsApi.undo(pageId, fromPos, null);
          }
          setSlots((prev) => {
            const next = prev.filter((s) => s.position !== fromPos && s.position !== toPos);
            next.push({
              pageId,
              position: toPos,
              card: fromSlot.card,
              updatedAt: new Date().toISOString(),
            });
            if (toSlot?.card) {
              next.push({
                pageId,
                position: fromPos,
                card: toSlot.card,
                updatedAt: new Date().toISOString(),
              });
            }
            return next;
          });
        } catch {
          setSlots((prev) => prev);
        }
      }
    },
    [currentPage, slots]
  );

  const handleUndo = useCallback(async () => {
    if (!undoState) return;
    const { pageId, position, previousCard } = undoState;
    setUndoState(null);
    try {
      await slotsApi.undo(pageId, position, previousCard);
      if (previousCard === null) {
        setSlots((prev) => prev.filter((s) => s.position !== position));
      } else {
        setSlots((prev) => {
          const next = prev.filter((s) => s.position !== position);
          next.push({
            pageId,
            position,
            card: previousCard,
            updatedAt: new Date().toISOString(),
          });
          return next;
        });
      }
    } catch {
      setUndoState(undoState);
    }
  }, [undoState]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  if (loading || !binder) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        {loading ? "Loading…" : "Binder not found."}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b flex items-center justify-between">
        <h1 className="text-xl font-semibold">{binder.name}</h1>
        <div className="flex gap-2">
          {undoState && (
            <Button variant="outline" size="sm" onClick={handleUndo}>
              Undo
            </Button>
          )}
          <Button size="sm" onClick={() => { setSearchTargetPosition(null); setSearchOpen(true); }}>
            Add card
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SlotGrid
            pageId={currentPage?.pageId ?? ""}
            slots={slotsByPosition()}
            onSlotClick={(pos) => { setSearchTargetPosition(pos); setSearchOpen(true); }}
            onSetCard={applySlotUpdate}
          />
        </DndContext>
      </div>
      {searchOpen && (
        <CardSearchModal
          open={searchOpen}
          onClose={() => { setSearchOpen(false); setSearchTargetPosition(null); }}
          onSelect={(card) => {
            if (currentPage) {
              const pos = searchTargetPosition ?? [0, 1, 2, 3, 4, 5, 6, 7, 8].find(
                (p) => !slots.some((s) => s.position === p)
              );
              if (pos != null) {
                applySlotUpdate(currentPage.pageId, pos, card);
              }
            }
            setSearchOpen(false);
            setSearchTargetPosition(null);
          }}
        />
      )}
    </div>
  );
}
