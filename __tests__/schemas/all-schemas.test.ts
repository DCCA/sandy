import { describe, it, expect } from "vitest";
import { registry, getRegistryKeys } from "@/lib/registry";

// Generic coverage across every registered component schema, complementing the
// hand-written per-schema cases in component-schemas.test.ts.
describe("All registry schemas", () => {
  const builtinKeys = getRegistryKeys().filter((key) => key in registry);

  it("covers every built-in component", () => {
    expect(builtinKeys.length).toBeGreaterThanOrEqual(20);
  });

  for (const key of builtinKeys) {
    const item = registry[key];

    it(`${key}: example props validate`, () => {
      expect(item.schema.safeParse(item.example.props).success).toBe(true);
    });

    it(`${key}: rejects non-object input`, () => {
      expect(item.schema.safeParse("nope").success).toBe(false);
      expect(item.schema.safeParse(null).success).toBe(false);
      expect(item.schema.safeParse(42).success).toBe(false);
    });

    it(`${key}: rejects unsafe href injection where applicable`, () => {
      // If the example contains any href-bearing object, a javascript: URL must
      // be rejected by the safeHref refinement. This is a no-op for components
      // without links.
      const json = JSON.stringify(item.example.props);
      if (json.includes('"href"')) {
        const poisoned = JSON.parse(
          json.replaceAll(/"href":\s*"[^"]*"/g, '"href":"javascript:alert(1)"'),
        );
        expect(item.schema.safeParse(poisoned).success).toBe(false);
      }
    });
  }
});
