import type { PrimitiveNode } from "./types";

/**
 * Deepest nesting level the builder will create. The renderer refuses to draw anything
 * deeper (MAX_DEPTH in components/composite/primitive-renderers.tsx), and a node the user
 * can build but never see is worse than one they cannot build.
 */
export const MAX_NEST_DEPTH = 2;

export function findNode(nodes: PrimitiveNode[], id: string): PrimitiveNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const hit = findNode(node.children, id);
      if (hit) return hit;
    }
  }
  return null;
}

/** Nesting level of a node, 0 for top level, -1 when it isn't in the tree. */
export function depthOf(nodes: PrimitiveNode[], id: string, depth = 0): number {
  for (const node of nodes) {
    if (node.id === id) return depth;
    if (node.children) {
      const hit = depthOf(node.children, id, depth + 1);
      if (hit >= 0) return hit;
    }
  }
  return -1;
}

/**
 * Append `node` to the children of `parentId`, or to the top level when it is null.
 * Only containers can take children; anything else is left untouched.
 */
export function insertNode(
  nodes: PrimitiveNode[],
  parentId: string | null,
  node: PrimitiveNode,
): PrimitiveNode[] {
  if (parentId === null) return [...nodes, node];

  return nodes.map((current) => {
    if (current.id === parentId) {
      if (current.type !== "container") return current;
      return { ...current, children: [...(current.children ?? []), node] };
    }
    if (current.children) {
      return { ...current, children: insertNode(current.children, parentId, node) };
    }
    return current;
  });
}

export function removeNode(nodes: PrimitiveNode[], id: string): PrimitiveNode[] {
  return nodes
    .filter((node) => node.id !== id)
    .map((node) => (node.children ? { ...node, children: removeNode(node.children, id) } : node));
}

/** Reorder a node among its own siblings. Moving across parents is not supported. */
export function moveNode(
  nodes: PrimitiveNode[],
  id: string,
  direction: "up" | "down",
): PrimitiveNode[] {
  const idx = nodes.findIndex((node) => node.id === id);

  if (idx >= 0) {
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (swapIdx < 0 || swapIdx >= nodes.length) return nodes;
    const next = [...nodes];
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    return next;
  }

  return nodes.map((node) =>
    node.children ? { ...node, children: moveNode(node.children, id, direction) } : node,
  );
}

export function updateNodeProps(
  nodes: PrimitiveNode[],
  id: string,
  props: Record<string, unknown>,
): PrimitiveNode[] {
  return nodes.map((node) => {
    if (node.id === id) return { ...node, props };
    if (node.children) {
      return { ...node, children: updateNodeProps(node.children, id, props) };
    }
    return node;
  });
}
