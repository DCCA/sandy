import type { ComponentType } from "react";
import type { RegistryItem } from "./types";
import type { CompositeDefinition } from "@/lib/composite/types";
import { generateSchemaFromBindings } from "@/lib/composite/schema-gen";

// Mutable runtime registry for user-created composites.
//
// React cannot observe mutations to a plain module-level object, so anything that
// reads this registry during render (notably the validation memo in the sandbox page)
// would keep a stale result forever. Registration itself is therefore the change
// signal: every mutation bumps `version` and notifies subscribers, which readers
// consume via useSyncExternalStore. Do not swap this for "add composites state to a
// dep array" - that only works while a setState happens to sit beside every
// register call, and fails silently the moment one doesn't.
const compositeRegistry: Record<string, RegistryItem> = {};

let version = 0;
const listeners = new Set<() => void>();

function emit(): void {
  version++;
  for (const listener of listeners) listener();
}

export function subscribeToComposites(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getCompositeVersion(): number {
  return version;
}

export function registerComposite(
  def: CompositeDefinition,
  component: ComponentType<Record<string, unknown>>,
): void {
  const schema = generateSchemaFromBindings(def.propBindings);

  // Build default props from bindings for example
  const exampleProps: Record<string, unknown> = {};
  for (const binding of def.propBindings) {
    if (binding.default !== undefined) {
      exampleProps[binding.propKey] = binding.default;
    } else if (binding.type === "string") {
      exampleProps[binding.propKey] = "";
    } else if (binding.type === "boolean") {
      exampleProps[binding.propKey] = false;
    } else if (binding.type === "number") {
      exampleProps[binding.propKey] = 0;
    }
  }

  compositeRegistry[def.id] = {
    component,
    schema,
    example: {
      id: "sec_1",
      component: def.id,
      props: exampleProps,
    },
    metadata: {
      name: def.name,
      description: def.description ?? "Custom component",
      supportsTheme: true,
    },
  };

  emit();
}

export function unregisterComposite(id: string): void {
  if (!(id in compositeRegistry)) return;
  delete compositeRegistry[id];
  emit();
}

export function getCompositeItem(key: string): RegistryItem | undefined {
  return compositeRegistry[key];
}

export function getCompositeKeys(): string[] {
  return Object.keys(compositeRegistry);
}
