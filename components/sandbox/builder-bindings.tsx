"use client";

import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { primitiveLabels } from "@/lib/composite/primitives";
import type { PropBinding, PrimitiveNode } from "@/lib/composite/types";

type BuilderBindingsProps = {
  bindings: PropBinding[];
  nodes: PrimitiveNode[];
  onChange: (bindings: PropBinding[]) => void;
};

// Get a flat list of bindable property paths from node tree
function getBindableTargets(nodes: PrimitiveNode[]): { label: string; path: (string | number)[]; nodeId: string }[] {
  const targets: { label: string; path: (string | number)[]; nodeId: string }[] = [];

  function walk(nodeList: PrimitiveNode[], prefix: (string | number)[]) {
    for (let i = 0; i < nodeList.length; i++) {
      const node = nodeList[i];
      const nodePath = [...prefix, i];
      const nodeLabel = `${primitiveLabels[node.type] ?? node.type} #${i + 1}`;

      for (const propKey of Object.keys(node.props)) {
        targets.push({
          label: `${nodeLabel} > ${propKey}`,
          path: [...nodePath, "props", propKey],
          nodeId: node.id,
        });
      }

      if (node.children) {
        walk(node.children, [...nodePath, "children"]);
      }
    }
  }

  walk(nodes, []);
  return targets;
}

export function BuilderBindings({ bindings, nodes, onChange }: BuilderBindingsProps) {
  const targets = getBindableTargets(nodes);

  const handleAdd = useCallback(() => {
    const newBinding: PropBinding = {
      propKey: `prop_${bindings.length + 1}`,
      label: `Property ${bindings.length + 1}`,
      type: "string",
      required: false,
      default: "",
      targetPath: [],
    };
    onChange([...bindings, newBinding]);
  }, [bindings, onChange]);

  const handleRemove = useCallback((idx: number) => {
    onChange(bindings.filter((_, i) => i !== idx));
  }, [bindings, onChange]);

  const handleUpdate = useCallback((idx: number, partial: Partial<PropBinding>) => {
    const updated = bindings.map((b, i) => (i === idx ? { ...b, ...partial } : b));
    onChange(updated);
  }, [bindings, onChange]);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground">Prop Bindings</span>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs gap-1"
          onClick={handleAdd}
        >
          <Plus className="size-3" />
          Add
        </Button>
      </div>
      {bindings.length === 0 && (
        <div className="text-[10px] text-muted-foreground/50 text-center py-2">
          Bindings map exposed props to internal node properties
        </div>
      )}
      <div className="space-y-2">
        {bindings.map((binding, idx) => (
          <div key={idx} className="border border-border/30 rounded-md p-2 space-y-1.5">
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={binding.propKey}
                onChange={(e) => handleUpdate(idx, { propKey: e.target.value })}
                placeholder="propKey"
                className="h-6 flex-1 min-w-0 rounded bg-muted/30 border border-border/50 px-2 font-mono text-[11px] text-foreground outline-none focus:border-accent/50"
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 text-red-400 hover:text-red-300"
                onClick={() => handleRemove(idx)}
                title="Remove binding"
              >
                <Trash2 className="size-3" />
              </Button>
            </div>
            <input
              type="text"
              value={binding.label}
              onChange={(e) => handleUpdate(idx, { label: e.target.value })}
              placeholder="Label"
              className="h-6 w-full rounded bg-muted/30 border border-border/50 px-2 text-[11px] text-foreground outline-none focus:border-accent/50"
            />
            <div className="flex items-center gap-1">
              <Select
                value={binding.type}
                onValueChange={(v) => v && handleUpdate(idx, { type: v as PropBinding["type"] })}
              >
                <SelectTrigger className="h-6 text-[11px] flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="enum">Enum</SelectItem>
                </SelectContent>
              </Select>
              <label className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0">
                <input
                  type="checkbox"
                  checked={binding.required}
                  onChange={(e) => handleUpdate(idx, { required: e.target.checked })}
                  className="size-3"
                />
                Req
              </label>
            </div>
            {/* Target path picker */}
            <Select
              value={binding.targetPath.length > 0 ? JSON.stringify(binding.targetPath) : ""}
              onValueChange={(v) => {
                if (!v) return;
                try {
                  handleUpdate(idx, { targetPath: JSON.parse(v) });
                } catch { /* ignore parse errors */ }
              }}
            >
              <SelectTrigger className="h-6 text-[10px]">
                <SelectValue placeholder="Select target..." />
              </SelectTrigger>
              <SelectContent>
                {targets.map((t, ti) => (
                  <SelectItem key={ti} value={JSON.stringify(t.path)}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
