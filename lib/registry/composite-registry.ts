import type { ComponentType } from "react";
import type { RegistryItem } from "./types";
import type { CompositeDefinition } from "@/lib/composite/types";
import { generateSchemaFromBindings } from "@/lib/composite/schema-gen";

// Mutable runtime registry for user-created composites
const compositeRegistry: Record<string, RegistryItem> = {};

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
}

export function unregisterComposite(id: string): void {
  delete compositeRegistry[id];
}

export function getCompositeItem(key: string): RegistryItem | undefined {
  return compositeRegistry[key];
}

export function getCompositeKeys(): string[] {
  return Object.keys(compositeRegistry);
}

export function clearCompositeRegistry(): void {
  for (const key of Object.keys(compositeRegistry)) {
    delete compositeRegistry[key];
  }
}
