"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BuilderPalette } from "./builder-palette";
import { BuilderNodeTree } from "./builder-node-tree";
import { BuilderBindings } from "./builder-bindings";
import { NodeRenderer } from "@/components/composite/primitive-renderers";
import { getDefaultProps, primitiveSchemas } from "@/lib/composite/primitives";
import { applyTheme } from "@/lib/theme/css-vars";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { schemaToFields, type FieldDescriptor } from "@/lib/schema-introspect";
import type { PrimitiveNode, PrimitiveType, PropBinding, CompositeDefinition } from "@/lib/composite/types";
import type { ThemeTokens } from "@/lib/theme/types";

type ComponentBuilderProps = {
  themeTokens: ThemeTokens;
  editingDefinition: CompositeDefinition | null;
  onSave: (def: CompositeDefinition) => void;
  onClose: () => void;
};

function nextNodeId(): string {
  return `node_${crypto.randomUUID().slice(0, 8)}`;
}

function toSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "") || "custom_component";
}

// --- Inline node prop editor (reuses property-editor patterns) ---

function NodePropEditor({
  node,
  onChange,
}: {
  node: PrimitiveNode;
  onChange: (props: Record<string, unknown>) => void;
}) {
  const schema = primitiveSchemas[node.type];
  const fields = useMemo(() => (schema ? schemaToFields(schema) : []), [schema]);

  if (fields.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-muted-foreground mb-1">Node Properties</div>
      {fields.map((field) => (
        <InlineField
          key={field.key}
          field={field}
          value={node.props[field.key]}
          onChange={(v) => onChange({ ...node.props, [field.key]: v })}
        />
      ))}
    </div>
  );
}

function InlineField({
  field,
  value,
  onChange,
}: {
  field: FieldDescriptor;
  value: unknown;
  onChange: (v: unknown) => void;
}) {
  if (field.kind === "string" && field.enum) {
    return (
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-muted-foreground w-20 shrink-0">{field.label}</label>
        <Select
          value={typeof value === "string" ? value : (field.default ?? "")}
          onValueChange={(v) => v !== null && onChange(v)}
        >
          <SelectTrigger className="h-6 flex-1 min-w-0 text-[11px] font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {field.enum.map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
  if (field.kind === "string") {
    return (
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-muted-foreground w-20 shrink-0">{field.label}</label>
        <input
          type="text"
          value={typeof value === "string" ? value : (field.default ?? "")}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 flex-1 min-w-0 rounded bg-muted/30 border border-border/50 px-2 font-mono text-[11px] text-foreground outline-none focus:border-accent/50"
        />
      </div>
    );
  }
  if (field.kind === "boolean") {
    const checked = typeof value === "boolean" ? value : (field.default ?? false);
    return (
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-muted-foreground w-20 shrink-0">{field.label}</label>
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="size-3.5"
        />
      </div>
    );
  }
  if (field.kind === "number") {
    return (
      <div className="flex items-center gap-2">
        <label className="text-[11px] text-muted-foreground w-20 shrink-0">{field.label}</label>
        <input
          type="number"
          value={typeof value === "number" ? value : (field.default ?? 0)}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-6 w-20 rounded bg-muted/30 border border-border/50 px-2 font-mono text-[11px] text-foreground outline-none focus:border-accent/50"
        />
      </div>
    );
  }
  return null;
}

// --- Main builder ---

export function ComponentBuilder({
  themeTokens,
  editingDefinition,
  onSave,
  onClose,
}: ComponentBuilderProps) {
  const [name, setName] = useState(editingDefinition?.name ?? "");
  const [description, setDescription] = useState(editingDefinition?.description ?? "");
  const [nodes, setNodes] = useState<PrimitiveNode[]>(editingDefinition?.nodes ?? []);
  const [bindings, setBindings] = useState<PropBinding[]>(editingDefinition?.propBindings ?? []);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      applyTheme(themeTokens, previewRef.current);
    }
  }, [themeTokens]);

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedNodeId) ?? null,
    [nodes, selectedNodeId],
  );

  const handleAddPrimitive = useCallback((type: PrimitiveType) => {
    const defaultProps = getDefaultProps(type);
    const newNode: PrimitiveNode = {
      id: nextNodeId(),
      type,
      props: defaultProps,
      ...(type === "container" ? { children: [] } : {}),
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(newNode.id);
  }, []);

  const handleMoveNode = useCallback((id: string, direction: "up" | "down") => {
    setNodes((prev) => {
      const idx = prev.findIndex((n) => n.id === id);
      if (idx < 0) return prev;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }, []);

  const handleDeleteNode = useCallback((id: string) => {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNodeId === id) setSelectedNodeId(null);
  }, [selectedNodeId]);

  const handleNodePropsChange = useCallback((props: Record<string, unknown>) => {
    if (!selectedNodeId) return;
    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, props } : n)),
    );
  }, [selectedNodeId]);

  const handleSave = useCallback(() => {
    if (!name.trim() || nodes.length === 0) return;
    const id = editingDefinition?.id ?? `custom_${toSlug(name)}_${Date.now().toString(36)}`;
    const def: CompositeDefinition = {
      id,
      name: name.trim(),
      description: description.trim() || undefined,
      nodes,
      propBindings: bindings,
      version: "1.0",
    };
    onSave(def);
  }, [name, description, nodes, bindings, editingDefinition, onSave]);

  const canSave = name.trim().length > 0 && nodes.length > 0;

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-md flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50 shrink-0">
        <span className="text-sm font-semibold">Component Builder</span>
        <div className="flex-1" />
        <Button
          variant="secondary"
          size="sm"
          className="h-7 px-3 text-xs"
          onClick={handleSave}
          disabled={!canSave}
        >
          Save
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onClose}
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Name / Description */}
      <div className="flex items-center gap-3 px-4 py-2 border-b border-border/50 shrink-0">
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-muted-foreground shrink-0">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Component"
            className="h-7 flex-1 min-w-0 rounded bg-muted/30 border border-border/50 px-2 text-xs text-foreground outline-none focus:border-accent/50"
          />
        </div>
        <div className="flex items-center gap-2 flex-1">
          <label className="text-xs text-muted-foreground shrink-0">Description</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Optional description"
            className="h-7 flex-1 min-w-0 rounded bg-muted/30 border border-border/50 px-2 text-xs text-foreground outline-none focus:border-accent/50"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 grid grid-cols-[300px_1fr_280px] overflow-hidden">
        {/* Left: Palette + Node Tree + Node Props */}
        <div className="border-r border-border/50 overflow-y-auto p-3 space-y-4">
          <BuilderPalette onAdd={handleAddPrimitive} />
          <BuilderNodeTree
            nodes={nodes}
            selectedNodeId={selectedNodeId}
            onSelect={setSelectedNodeId}
            onMove={handleMoveNode}
            onDelete={handleDeleteNode}
          />
          {selectedNode && (
            <NodePropEditor
              node={selectedNode}
              onChange={handleNodePropsChange}
            />
          )}
        </div>

        {/* Center: Live Preview */}
        <div className="overflow-auto p-6 dot-grid flex justify-center">
          <div className="w-full max-w-lg h-fit">
            <div className="rounded-lg overflow-hidden shadow-2xl shadow-black/20 border border-white/[0.04]">
              <div className="h-7 bg-[#171717] border-b border-white/[0.04] flex items-center px-3 gap-1.5">
                <span className="size-2.5 rounded-full bg-white/10" />
                <span className="size-2.5 rounded-full bg-white/10" />
                <span className="size-2.5 rounded-full bg-white/10" />
              </div>
              <div
                ref={previewRef}
                style={{
                  backgroundColor: "var(--sandy-color-background, #fff)",
                  color: "var(--sandy-color-foreground, #111)",
                  padding: "var(--sandy-spacing-lg, 24px)",
                }}
              >
                {nodes.length === 0 ? (
                  <div className="text-center text-sm opacity-40 py-12">
                    Add primitives to build your component
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--sandy-spacing-md, 16px)" }}>
                    {nodes.map((node) => (
                      <NodeRenderer key={node.id} node={node} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Bindings */}
        <div className="border-l border-border/50 overflow-y-auto p-3">
          <BuilderBindings
            bindings={bindings}
            nodes={nodes}
            onChange={setBindings}
          />
        </div>
      </div>
    </div>
  );
}
