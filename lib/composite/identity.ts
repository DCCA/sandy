import { slugify } from "@/lib/utils";
import type { CompositeDefinition } from "./types";

/**
 * Registry keys for composites are opaque and permanent: sections reference them, so a
 * rename must never change one. The readable prefix is a convenience for debugging only.
 */
export function newCompositeId(name: string): string {
  return `custom_${slugify(name, "_", "custom_component")}_${Date.now().toString(36)}`;
}

/**
 * Clone a composite under a fresh identity. The copy must not reuse the id, or saving it
 * would overwrite the original rather than sit beside it in the library.
 */
export function duplicateComposite(
  def: CompositeDefinition,
  existingNames: string[],
): CompositeDefinition {
  const taken = new Set(existingNames);
  let name = `${def.name} copy`;
  let n = 2;
  while (taken.has(name)) {
    name = `${def.name} copy ${n}`;
    n++;
  }

  return {
    ...structuredClone(def),
    id: newCompositeId(name),
    name,
    createdAt: undefined,
    updatedAt: undefined,
  };
}
