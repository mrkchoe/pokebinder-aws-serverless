"use client";

import { useDraggable, useDroppable } from "@dnd-kit/core";
import type { Slot } from "@/lib/api";
import type { CardPayload } from "@/lib/api";
import { cn } from "@/lib/utils";

interface SlotGridProps {
  pageId: string;
  slots: (Slot | null)[];
  onSlotClick: (position: number) => void;
  onSetCard: (pageId: string, position: number, card: CardPayload | null) => void;
}

function DraggableSlot({
  slot,
  position,
  onClear,
}: {
  slot: Slot;
  position: number;
  onClear: () => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(position),
    data: { slot, position },
  });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={cn(
        "aspect-[2/3] max-w-[120px] rounded-lg border-2 border-transparent bg-card overflow-hidden cursor-grab active:cursor-grabbing",
        isDragging && "opacity-50"
      )}
    >
      <div className="relative w-full h-full group">
        <img
          src={slot.card.imageSmall}
          alt={slot.card.name}
          className="w-full h-full object-cover"
          draggable={false}
        />
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClear();
          }}
          className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 bg-black/60 text-white rounded p-1 text-xs"
        >
          Clear
        </button>
      </div>
    </div>
  );
}

function DroppableCell({
  position,
  slot,
  pageId,
  onSlotClick,
  onSetCard,
}: {
  position: number;
  slot: Slot | null;
  pageId: string;
  onSlotClick: (position: number) => void;
  onSetCard: (pageId: string, position: number, card: CardPayload | null) => void;
}) {
  const { isOver, setNodeRef } = useDroppable({ id: String(position) });
  return (
    <div
      ref={setNodeRef}
      onClick={() => onSlotClick(position)}
      className={cn(
        "min-h-[160px] flex items-center justify-center rounded-lg border-2 border-dashed bg-muted/50 transition-colors",
        isOver && "border-primary bg-primary/10"
      )}
    >
      {slot ? (
        <DraggableSlot
          slot={slot}
          position={position}
          onClear={() => onSetCard(pageId, position, null)}
        />
      ) : (
        <span className="text-muted-foreground text-sm">+</span>
      )}
    </div>
  );
}

export function SlotGrid({
  pageId,
  slots,
  onSlotClick,
  onSetCard,
}: SlotGridProps) {
  return (
    <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto">
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((pos) => (
        <DroppableCell
          key={pos}
          position={pos}
          slot={slots[pos] ?? null}
          pageId={pageId}
          onSlotClick={onSlotClick}
          onSetCard={onSetCard}
        />
      ))}
    </div>
  );
}
