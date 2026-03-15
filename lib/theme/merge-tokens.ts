import type { ThemeTokens, DeepPartial } from "./types";

const VALID_CATEGORIES: Set<string> = new Set([
  "color", "radius", "spacing", "typography", "shadow",
]);

export function mergeTokens(
  base: ThemeTokens,
  overrides: DeepPartial<ThemeTokens>
): ThemeTokens {
  const result = structuredClone(base);
  for (const category of Object.keys(overrides) as (keyof ThemeTokens)[]) {
    if (!VALID_CATEGORIES.has(category)) continue;
    const partial = overrides[category];
    if (partial && typeof partial === "object") {
      // Only copy keys that exist in the base to prevent injection
      const baseCategory = result[category];
      for (const key of Object.keys(partial)) {
        if (key in baseCategory) {
          (baseCategory as Record<string, unknown>)[key] = (partial as Record<string, unknown>)[key];
        }
      }
    }
  }
  return result;
}
