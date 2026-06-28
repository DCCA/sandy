import { z } from "zod";
import type { DeepPartial, ThemeTokens } from "./types";

/**
 * Validates a partial theme-token override object (the shape stored in the URL
 * `t` param and produced by the token editor). Every field is optional, but the
 * values are type-checked so a malformed/hostile payload is rejected before it
 * reaches mergeTokens. `.strict()` rejects unknown keys outright.
 */
const colorOverrides = z
  .object({
    background: z.string(),
    foreground: z.string(),
    primary: z.string(),
    secondary: z.string(),
    border: z.string(),
    muted: z.string(),
    accent: z.string(),
    success: z.string(),
    warning: z.string(),
    error: z.string(),
    info: z.string(),
    surface: z.string(),
    overlay: z.string(),
    focusRing: z.string(),
  })
  .partial()
  .strict();

const radiusOverrides = z
  .object({ sm: z.number(), md: z.number(), lg: z.number(), full: z.number() })
  .partial()
  .strict();

const spacingOverrides = z
  .object({
    xs: z.number(),
    sm: z.number(),
    md: z.number(),
    lg: z.number(),
    xl: z.number(),
    "2xl": z.number(),
  })
  .partial()
  .strict();

const typographyOverrides = z
  .object({
    fontFamily: z.string(),
    headingWeight: z.number(),
    bodyWeight: z.number(),
    fontSize: z
      .object({
        xs: z.number(),
        sm: z.number(),
        md: z.number(),
        lg: z.number(),
        xl: z.number(),
        "2xl": z.number(),
      })
      .partial()
      .strict(),
    lineHeight: z
      .object({ tight: z.number(), normal: z.number(), relaxed: z.number() })
      .partial()
      .strict(),
    letterSpacing: z
      .object({ tight: z.string(), normal: z.string(), wide: z.string() })
      .partial()
      .strict(),
  })
  .partial()
  .strict();

const shadowOverrides = z
  .object({ sm: z.string(), md: z.string(), lg: z.string() })
  .partial()
  .strict();

const opacityOverrides = z
  .object({ disabled: z.number(), hover: z.number(), overlay: z.number() })
  .partial()
  .strict();

const borderOverrides = z.object({ thin: z.string(), thick: z.string() }).partial().strict();

export const CustomThemeSchema = z
  .object({
    color: colorOverrides,
    radius: radiusOverrides,
    spacing: spacingOverrides,
    typography: typographyOverrides,
    shadow: shadowOverrides,
    opacity: opacityOverrides,
    border: borderOverrides,
  })
  .partial()
  .strict();

/** Returns the validated overrides, or null if the payload is malformed. */
export function parseThemeOverrides(data: unknown): DeepPartial<ThemeTokens> | null {
  const result = CustomThemeSchema.safeParse(data);
  return result.success ? (result.data as DeepPartial<ThemeTokens>) : null;
}
