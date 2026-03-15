"use client";

import { Button } from "@/components/ui/button";
import {
  Heading1,
  AlignLeft,
  MousePointer,
  ImageIcon,
  Minus,
  SeparatorHorizontal,
  Tag,
  LayoutGrid,
} from "lucide-react";
import type { PrimitiveType } from "@/lib/composite/types";

const primitives: { type: PrimitiveType; label: string; icon: React.ReactNode }[] = [
  { type: "heading", label: "Heading", icon: <Heading1 className="size-4" /> },
  { type: "paragraph", label: "Text", icon: <AlignLeft className="size-4" /> },
  { type: "button", label: "Button", icon: <MousePointer className="size-4" /> },
  { type: "image", label: "Image", icon: <ImageIcon className="size-4" /> },
  { type: "spacer", label: "Spacer", icon: <Minus className="size-4" /> },
  { type: "divider", label: "Divider", icon: <SeparatorHorizontal className="size-4" /> },
  { type: "badge", label: "Badge", icon: <Tag className="size-4" /> },
  { type: "container", label: "Container", icon: <LayoutGrid className="size-4" /> },
];

type BuilderPaletteProps = {
  onAdd: (type: PrimitiveType) => void;
};

export function BuilderPalette({ onAdd }: BuilderPaletteProps) {
  return (
    <div>
      <div className="text-xs font-semibold text-muted-foreground mb-2">Primitives</div>
      <div className="grid grid-cols-4 gap-1.5">
        {primitives.map(({ type, label, icon }) => (
          <Button
            key={type}
            variant="outline"
            size="sm"
            className="h-auto py-2 px-1.5 flex flex-col gap-1 text-[10px] font-medium"
            onClick={() => onAdd(type)}
          >
            {icon}
            {label}
          </Button>
        ))}
      </div>
    </div>
  );
}
