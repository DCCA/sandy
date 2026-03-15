"use client";

import { useState, useCallback, useRef, memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Trash2, GripVertical } from "lucide-react";
import type { Section } from "@/lib/registry/types";

type SectionListProps = {
  sections: Section[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onReorder: (orderedIds: string[]) => void;
  onDelete: (id: string) => void;
};

export const SectionList = memo(function SectionList({
  sections,
  selectedId,
  onSelect,
  onMove,
  onReorder,
  onDelete,
}: SectionListProps) {
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<"above" | "below" | null>(null);
  const dragSourceId = useRef<string | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    dragSourceId.current = id;
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    // Make the drag image slightly transparent
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "0.5";
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = "";
    }
    dragSourceId.current = null;
    setDragOverId(null);
    setDragOverPosition(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (id === dragSourceId.current) {
      setDragOverId(null);
      setDragOverPosition(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    setDragOverId(id);
    setDragOverPosition(e.clientY < midY ? "above" : "below");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    const sourceId = dragSourceId.current;
    if (!sourceId || sourceId === targetId) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    const position = e.clientY < midY ? "above" : "below";

    const ids = sections.map((s) => s.id);
    const fromIdx = ids.indexOf(sourceId);
    const toIdx = ids.indexOf(targetId);
    if (fromIdx < 0 || toIdx < 0) return;

    // Remove source from list, then insert at target position
    const without = ids.filter((id) => id !== sourceId);
    const insertIdx = position === "above"
      ? without.indexOf(targetId)
      : without.indexOf(targetId) + 1;
    without.splice(insertIdx, 0, sourceId);

    onReorder(without);
    setDragOverId(null);
    setDragOverPosition(null);
  }, [sections, onReorder]);

  if (sections.length === 0) return null;

  return (
    <div className="border-b border-border/50 shrink-0">
      <div className="px-3 py-1.5 text-xs text-muted-foreground font-mono flex items-center justify-between">
        <span>Sections</span>
        <span className="px-1.5 py-0.5 rounded bg-muted/50 text-[10px]">
          {sections.length}
        </span>
      </div>
      <div className="px-2 pb-2 space-y-0.5 max-h-[180px] overflow-auto">
        {sections.map((section, i) => {
          const isDropTarget = dragOverId === section.id;
          return (
            <div
              key={section.id}
              draggable
              onDragStart={(e) => handleDragStart(e, section.id)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDrop={(e) => handleDrop(e, section.id)}
              className={`flex items-center gap-1 px-1 py-1 rounded-md transition-colors group cursor-pointer ${
                selectedId === section.id
                  ? "bg-accent/15 ring-1 ring-accent/30"
                  : "bg-muted/20 hover:bg-muted/30"
              }`}
              style={{
                borderTop: isDropTarget && dragOverPosition === "above" ? "2px solid var(--accent)" : "2px solid transparent",
                borderBottom: isDropTarget && dragOverPosition === "below" ? "2px solid var(--accent)" : "2px solid transparent",
              }}
              onClick={() => onSelect(section.id)}
            >
              <span
                className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground/70 shrink-0"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <GripVertical className="size-3" />
              </span>
              <span className="text-[10px] text-muted-foreground/60 font-mono w-4 shrink-0">
                {i + 1}
              </span>
              <span className="text-xs font-medium truncate flex-1">
                {section.component}
              </span>
              <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={(e) => { e.stopPropagation(); onMove(section.id, "up"); }}
                  disabled={i === 0}
                  title="Move up"
                >
                  <ChevronUp className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0"
                  onClick={(e) => { e.stopPropagation(); onMove(section.id, "down"); }}
                  disabled={i === sections.length - 1}
                  title="Move down"
                >
                  <ChevronDown className="size-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 text-red-400 hover:text-red-300"
                  onClick={(e) => { e.stopPropagation(); onDelete(section.id); }}
                  disabled={sections.length <= 1}
                  title="Delete section"
                >
                  <Trash2 className="size-3" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});
