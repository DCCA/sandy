import { describe, it, expect } from "vitest";
import { tokensToDTCG, dtcgToOverrides } from "@/lib/theme/dtcg";
import { defaultTheme } from "@/lib/theme/presets";
import { mergeTokens } from "@/lib/theme/merge-tokens";

describe("DTCG export", () => {
  it("emits $type/$value tokens grouped by category", () => {
    const doc = tokensToDTCG(defaultTheme.tokens);
    expect(doc.color.primary).toEqual({
      $type: "color",
      $value: defaultTheme.tokens.color.primary,
    });
    expect(doc.radius.md).toEqual({ $type: "dimension", $value: "14px" });
    expect((doc.typography.fontSize as Record<string, unknown>).md).toEqual({
      $type: "dimension",
      $value: "15px",
    });
  });
});

describe("DTCG import", () => {
  it("parses a DTCG document back into overrides", () => {
    const overrides = dtcgToOverrides({
      color: { primary: { $type: "color", $value: "#abcdef" } },
      radius: { md: { $type: "dimension", $value: "10px" } },
    });
    expect(overrides).toEqual({ color: { primary: "#abcdef" }, radius: { md: 10 } });
  });

  it("round-trips a full token set", () => {
    const doc = tokensToDTCG(defaultTheme.tokens);
    const overrides = dtcgToOverrides(doc);
    expect(overrides).not.toBeNull();
    const restored = mergeTokens(defaultTheme.tokens, overrides!);
    expect(restored.color).toEqual(defaultTheme.tokens.color);
    expect(restored.radius).toEqual(defaultTheme.tokens.radius);
    expect(restored.spacing).toEqual(defaultTheme.tokens.spacing);
    expect(restored.typography.fontSize).toEqual(defaultTheme.tokens.typography.fontSize);
  });

  it("ignores unknown tokens from a foreign file", () => {
    const overrides = dtcgToOverrides({
      color: {
        primary: { $type: "color", $value: "#111111" },
        brandX: { $type: "color", $value: "#222" },
      },
      somethingElse: { foo: { $type: "color", $value: "#333" } },
    });
    expect(overrides).toEqual({ color: { primary: "#111111" } });
  });

  it("returns null for non-objects", () => {
    expect(dtcgToOverrides(null)).toBeNull();
    expect(dtcgToOverrides("nope")).toBeNull();
  });
});
