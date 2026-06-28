import type { CompositeDefinition, PrimitiveNode, PropBinding } from "./types";
import { isValidDefinition } from "./storage";

/**
 * Import/export for custom composite components, so a user-built component can
 * be shared as a portable `.json` file instead of being trapped in one
 * browser's localStorage.
 */

export const COMPOSITE_FILE_VERSION = "1.0";

type CompositeBundle = {
  $schema: "sandy-composite";
  version: string;
  composites: CompositeDefinition[];
};

/** Serialize one or more composites into a portable bundle string. */
export function exportComposites(defs: CompositeDefinition[]): string {
  const bundle: CompositeBundle = {
    $schema: "sandy-composite",
    version: COMPOSITE_FILE_VERSION,
    composites: defs,
  };
  return JSON.stringify(bundle, null, 2);
}

export function exportComposite(def: CompositeDefinition): string {
  return exportComposites([def]);
}

function isPrimitiveNode(n: unknown): n is PrimitiveNode {
  if (!n || typeof n !== "object") return false;
  const node = n as Record<string, unknown>;
  if (typeof node.id !== "string" || typeof node.type !== "string") return false;
  if (typeof node.props !== "object" || node.props === null) return false;
  if (node.children !== undefined) {
    if (!Array.isArray(node.children)) return false;
    if (!node.children.every(isPrimitiveNode)) return false;
  }
  return true;
}

function isPropBinding(b: unknown): b is PropBinding {
  if (!b || typeof b !== "object") return false;
  const binding = b as Record<string, unknown>;
  return (
    typeof binding.propKey === "string" &&
    typeof binding.label === "string" &&
    typeof binding.type === "string" &&
    typeof binding.required === "boolean" &&
    Array.isArray(binding.targetPath)
  );
}

/** Deep structural validation for an imported (untrusted) definition. */
function isFullyValidDefinition(d: unknown): d is CompositeDefinition {
  if (!isValidDefinition(d)) return false;
  return d.nodes.every(isPrimitiveNode) && d.propBindings.every(isPropBinding);
}

/**
 * Parse an imported bundle or bare definition/array into valid composite
 * definitions. Invalid entries are dropped; returns [] if nothing is usable.
 */
export function parseImportedComposites(json: string): CompositeDefinition[] {
  let data: unknown;
  try {
    data = JSON.parse(json);
  } catch {
    return [];
  }

  let candidates: unknown[];
  if (Array.isArray(data)) {
    candidates = data;
  } else if (
    data &&
    typeof data === "object" &&
    Array.isArray((data as CompositeBundle).composites)
  ) {
    candidates = (data as CompositeBundle).composites;
  } else {
    candidates = [data];
  }

  return candidates.filter(isFullyValidDefinition);
}
