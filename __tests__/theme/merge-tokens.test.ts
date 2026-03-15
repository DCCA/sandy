import { describe, it, expect } from "vitest";
import { mergeTokens } from "@/lib/theme/merge-tokens";
import { defaultTheme } from "@/lib/theme/presets";

const base = defaultTheme.tokens;

describe("mergeTokens", () => {
  it("returns base when overrides are empty", () => {
    const result = mergeTokens(base, {});
    expect(result).toEqual(base);
  });

  it("does not mutate the base object", () => {
    const original = structuredClone(base);
    mergeTokens(base, { color: { primary: "#ff0000" } });
    expect(base).toEqual(original);
  });

  it("overrides a single color token", () => {
    const result = mergeTokens(base, { color: { primary: "#ff0000" } });
    expect(result.color.primary).toBe("#ff0000");
    expect(result.color.background).toBe(base.color.background);
  });

  it("overrides multiple categories", () => {
    const result = mergeTokens(base, {
      color: { primary: "#ff0000" },
      radius: { sm: 99 },
    });
    expect(result.color.primary).toBe("#ff0000");
    expect(result.radius.sm).toBe(99);
    expect(result.radius.md).toBe(base.radius.md);
  });

  it("rejects unknown categories (injection protection)", () => {
    const result = mergeTokens(base, {
      // @ts-expect-error — testing injection protection
      __proto__: { primary: "injected" },
    });
    expect(result).toEqual(base);
  });

  it("rejects unknown keys within valid categories", () => {
    const result = mergeTokens(base, {
      color: {
        // @ts-expect-error — testing injection protection
        hacked: "injected",
        primary: "#ff0000",
      },
    });
    expect(result.color.primary).toBe("#ff0000");
    expect("hacked" in result.color).toBe(false);
  });

  it("handles typography overrides", () => {
    const result = mergeTokens(base, {
      typography: { fontFamily: "monospace" },
    });
    expect(result.typography.fontFamily).toBe("monospace");
    expect(result.typography.headingWeight).toBe(base.typography.headingWeight);
  });
});
