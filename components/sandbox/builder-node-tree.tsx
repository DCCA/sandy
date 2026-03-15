"use client";

import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";
import { primitiveLabels } from "@/lib/composite/primitives";
import type { PrimitiveNode } from "@/lib/composite/types";

type BuilderNodeTreeProps = {
  nodes: PrimitiveNode[];
  selectedNodeId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDelete: (id: string) => void;
};

export function BuilderNodeTree({
  nodes,
  selectedNodeId,
  onSelect,
  onMove,
  onDelete,
}: BuilderNodeTreeProps) {
  if (nodes.length === 0) {
    return (
      <div className="text-xs text-muted-foreground/50 text-center py-4">
        Add primitives from the palette above
      </div>
    );
  }

  return (
    <div className="space-y-0.5">
      <div className="text-xs font-semibold text-muted-foreground mb-2">Node Tree</div>
      {nodes.map((node, i) => (
        <NodeRow
          key={node.id}
          node={node}
          index={i}
          total={nodes.length}
          isSelected={selectedNodeId === node.id}
          onSelect={onSelect}
          onMove={onMove}
          onDelete={onDelete}
          depth={0}
        />
      ))}
    </div>
  );
}

function NodeRow({
  node,
  index,
  total,
  isSelected,
  onSelect,
  onMove,
  onDelete,
  depth,
}: {
  node: PrimitiveNode;
  index: number;
  total: number;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, direction: "up" | "down") => void;
  onDelete: (id: string) => void;
  depth: number;
}) {
  const label = primitiveLabels[node.type] ?? node.type;
  const preview = node.type === "heading" || node.type === "paragraph" || node.type === "button" || node.type === "badge"
    ? String(node.props.text ?? node.props.label ?? "")
    : "";

  return (
    <>
      <div
        className={`flex items-center gap-1 px-2 py-1 rounded-md transition-colors group cursor-pointer ${
          isSelected
            ? "bg-accent/15 ring-1 ring-accent/30"
            : "bg-muted/20 hover:bg-muted/30"
        }`}
        style={{ paddingLeft: `${8 + depth * 16}px` }}
        onClick={() => onSelect(node.id)}
      >
        <span className="text-[10px] text-muted-foreground/60 font-mono w-4 shrink-0">
          {index + 1}
        </span>
        <span className="text-xs font-medium shrink-0">{label}</span>
        {preview && (
          <span className="text-[10px] text-muted-foreground/50 truncate ml-1">
            {preview.length > 20 ? preview.slice(0, 20) + "..." : preview}
          </span>
        )}
        <div className="ml-auto flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={(e) => { e.stopPropagation(); onMove(node.id, "up"); }}
            disabled={index === 0}
            title="Move up"
          >
            <ChevronUp className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0"
            onClick={(e) => { e.stopPropagation(); onMove(node.id, "down"); }}
            disabled={index === total - 1}
            title="Move down"
          >
            <ChevronDown className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 w-5 p-0 text-red-400 hover:text-red-300"
            onClick={(e) => { e.stopPropagation(); onDelete(node.id); }}
            title="Delete"
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
      {/* Render children for containers */}
      {node.type === "container" && node.children?.map((child, ci) => (
        <NodeRow
          key={child.id}
          node={child}
          index={ci}
          total={node.children!.length}
          isSelected={isSelected}
          onSelect={onSelect}
          onMove={onMove}
          onDelete={onDelete}
          depth={depth + 1}
        />
      ))}
    </>
  );
}
