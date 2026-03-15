"use client";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import type { Section } from "@/lib/registry/types";

type SectionListProps = {
  sections: Section[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDelete: (id: string) => void;
};

export const SectionList = memo(function SectionList({
  sections,
  selectedId,
  onSelect,
  onMove,
  onDelete,
}: SectionListProps) {
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
        {sections.map((section, i) => (
          <div
            key={section.id}
            className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors group cursor-pointer ${
              selectedId === section.id
                ? "bg-accent/15 ring-1 ring-accent/30"
                : "bg-muted/20 hover:bg-muted/30"
            }`}
            onClick={() => onSelect(section.id)}
          >
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
        ))}
      </div>
    </div>
  );
});
