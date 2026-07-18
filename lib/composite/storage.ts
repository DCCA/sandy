import type { CompositeDefinition } from "./types";

const STORAGE_KEY = "sandy-composites";

export function isValidDefinition(d: unknown): d is CompositeDefinition {
  if (typeof d !== "object" || d === null) return false;
  const obj = d as Record<string, unknown>;
  return (
    typeof obj.id === "string" &&
    typeof obj.name === "string" &&
    Array.isArray(obj.nodes) &&
    Array.isArray(obj.propBindings) &&
    obj.version === "1.0"
  );
}

export type LoadResult = {
  definitions: CompositeDefinition[];
  /**
   * How many stored entries failed validation. These are a saved component the user
   * can no longer see, so the count is reported rather than swallowed - and note that
   * the next saveComposite() rewrites the whole blob, erasing them for good.
   */
  droppedCount: number;
};

export function loadComposites(): LoadResult {
  const empty: LoadResult = { definitions: [], droppedCount: 0 };
  if (typeof window === "undefined") return empty;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return empty;
    const definitions = parsed.filter(isValidDefinition);
    return { definitions, droppedCount: parsed.length - definitions.length };
  } catch {
    return empty;
  }
}

export function saveComposites(defs: CompositeDefinition[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defs));
  } catch {
    // Storage full or disabled — silently fail
  }
}

/** Persists the definition and returns it with its timestamps stamped, so callers can
 * keep component state in sync with what was actually written. */
export function saveComposite(def: CompositeDefinition): CompositeDefinition {
  const { definitions } = loadComposites();
  const idx = definitions.findIndex((d) => d.id === def.id);
  const now = Date.now();
  // Preserve the original creation time across edits so "recently updated" and
  // "when did I make this" stay distinct.
  const stamped: CompositeDefinition = {
    ...def,
    createdAt: def.createdAt ?? definitions[idx]?.createdAt ?? now,
    updatedAt: now,
  };
  if (idx >= 0) {
    definitions[idx] = stamped;
  } else {
    definitions.push(stamped);
  }
  saveComposites(definitions);
  return stamped;
}

export function deleteComposite(id: string): void {
  const { definitions } = loadComposites();
  saveComposites(definitions.filter((d) => d.id !== id));
}
