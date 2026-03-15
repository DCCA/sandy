import type { PrimitiveNode, PropBinding } from "./types";

/**
 * Deep-clone a node tree and apply prop bindings from section-level props.
 */
export function applyBindings(
  nodes: PrimitiveNode[],
  bindings: PropBinding[],
  props: Record<string, unknown>,
): PrimitiveNode[] {
  // Deep clone the node tree
  const cloned = structuredClone(nodes);

  for (const binding of bindings) {
    const value = props[binding.propKey] ?? binding.default;
    if (value === undefined) continue;
    setNestedValue(cloned, binding.targetPath, value);
  }

  return cloned;
}

function setNestedValue(
  obj: unknown,
  path: (string | number)[],
  value: unknown,
): void {
  if (path.length === 0) return;

  let current: unknown = obj;
  for (let i = 0; i < path.length - 1; i++) {
    const key = path[i];
    if (current === null || current === undefined) return;
    if (Array.isArray(current) && typeof key === "number") {
      current = current[key];
    } else if (typeof current === "object") {
      current = (current as Record<string, unknown>)[String(key)];
    } else {
      return;
    }
  }

  const lastKey = path[path.length - 1];
  if (current === null || current === undefined) return;
  if (Array.isArray(current) && typeof lastKey === "number") {
    current[lastKey] = value;
  } else if (typeof current === "object") {
    (current as Record<string, unknown>)[String(lastKey)] = value;
  }
}
