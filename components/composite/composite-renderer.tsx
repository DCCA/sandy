"use client";

import { useMemo } from "react";
import { NodeRenderer } from "./primitive-renderers";
import { applyBindings } from "@/lib/composite/render";
import type { CompositeDefinition } from "@/lib/composite/types";

type CompositeRendererProps = {
  definition: CompositeDefinition;
  props: Record<string, unknown>;
};

export function CompositeRenderer({ definition, props }: CompositeRendererProps) {
  const resolvedNodes = useMemo(
    () => applyBindings(definition.nodes, definition.propBindings, props),
    [definition, props],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--sandy-spacing-md, 16px)" }}>
      {resolvedNodes.map((node) => (
        <NodeRenderer key={node.id} node={node} />
      ))}
    </div>
  );
}
