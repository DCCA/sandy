import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { registry, getRegistryKeys } from "@/lib/registry";

describe("Component smoke tests", () => {
  const keys = getRegistryKeys();

  // Only test built-in registry components (not composites which need localStorage)
  const builtinKeys = keys.filter((key) => key in registry);

  for (const key of builtinKeys) {
    it(`${key} renders without throwing`, () => {
      const item = registry[key];
      const Component = item.component;
      const props = item.example.props;

      // Should not throw
      const html = renderToStaticMarkup(React.createElement(Component, props));
      expect(html).toBeTruthy();
      expect(typeof html).toBe("string");
    });

    it(`${key} example props pass schema validation`, () => {
      const item = registry[key];
      const result = item.schema.safeParse(item.example.props);
      expect(result.success).toBe(true);
    });
  }
});
