import { describe, it, expect } from "vitest";
import { themePresets, getThemePreset, getThemeTokens, defaultTheme } from "@/lib/theme/presets";
import { tokensToCSSVars } from "@/lib/theme/css-vars";
import type { ThemeTokens } from "@/lib/theme/types";

const REQUIRED_COLOR_KEYS: (keyof ThemeTokens["color"])[] = [
  "background",
  "foreground",
  "primary",
  "secondary",
  "border",
  "muted",
  "accent",
  "success",
  "warning",
  "error",
  "info",
  "surface",
  "overlay",
  "focusRing",
];

describe("theme presets", () => {
  it("every preset has a complete color token set", () => {
    for (const preset of themePresets) {
      for (const key of REQUIRED_COLOR_KEYS) {
        expect(preset.tokens.color[key], `${preset.id} missing color.${key}`).toBeTruthy();
      }
    }
  });

  it("emits a CSS variable for the focus ring", () => {
    const vars = tokensToCSSVars(defaultTheme.tokens);
    expect(vars["--sandy-color-focus-ring"]).toBe(defaultTheme.tokens.color.focusRing);
  });

  it("radius and spacing vars carry a px unit", () => {
    const vars = tokensToCSSVars(defaultTheme.tokens);
    expect(vars["--sandy-radius-md"]).toMatch(/px$/);
    expect(vars["--sandy-spacing-md"]).toMatch(/px$/);
  });
});

describe("getThemeTokens (light/dark mode)", () => {
  it("returns natural tokens when no mode is given", () => {
    expect(getThemeTokens("default")).toEqual(defaultTheme.tokens);
  });

  it("applies dark overrides for a light-base brand", () => {
    const dark = getThemeTokens("default", "dark");
    expect(dark.color.background).not.toBe(defaultTheme.tokens.color.background);
    // unrelated tokens are preserved
    expect(dark.color.primary).toBe(defaultTheme.tokens.color.primary);
  });

  it("applies light overrides for a dark-base brand", () => {
    const natural = getThemePreset("enterprise-dark")!.tokens;
    const light = getThemeTokens("enterprise-dark", "light");
    expect(light.color.background).not.toBe(natural.color.background);
  });

  it("falls back to default for an unknown brand", () => {
    expect(getThemeTokens("does-not-exist")).toEqual(defaultTheme.tokens);
  });
});
