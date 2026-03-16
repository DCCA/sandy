import type { ThemeTokens, DeepPartial } from "./types";

const VALID_CATEGORIES: Set<string> = new Set([
  "color", "radius", "spacing", "typography", "shadow", "opacity", "border",
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
          const baseValue = (baseCategory as Record<string, unknown>)[key];
          const overrideValue = (partial as Record<string, unknown>)[key];
          // Handle nested objects up to 2 levels deep (e.g., typography.fontSize, typography.lineHeight).
          // Deeper nesting is not supported — token structure should stay flat within sub-objects.
          if (baseValue && typeof baseValue === "object" && overrideValue && typeof overrideValue === "object") {
            for (const subKey of Object.keys(overrideValue as Record<string, unknown>)) {
              if (subKey in (baseValue as Record<string, unknown>)) {
                (baseValue as Record<string, unknown>)[subKey] = (overrideValue as Record<string, unknown>)[subKey];
              }
            }
          } else {
            (baseCategory as Record<string, unknown>)[key] = overrideValue;
          }
        }
      }
    }
  }
  return result;
}
