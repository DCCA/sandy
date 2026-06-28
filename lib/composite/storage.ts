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

export function loadComposites(): CompositeDefinition[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValidDefinition);
  } catch {
    return [];
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

export function saveComposite(def: CompositeDefinition): void {
  const existing = loadComposites();
  const idx = existing.findIndex((d) => d.id === def.id);
  if (idx >= 0) {
    existing[idx] = def;
  } else {
    existing.push(def);
  }
  saveComposites(existing);
}

export function deleteComposite(id: string): void {
  const existing = loadComposites();
  saveComposites(existing.filter((d) => d.id !== id));
}
