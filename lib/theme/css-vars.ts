import type { ThemeTokens } from "./types";

export function tokensToCSSVars(tokens: ThemeTokens): Record<string, string> {
  return {
    // Colors
    "--sandy-color-background": tokens.color.background,
    "--sandy-color-foreground": tokens.color.foreground,
    "--sandy-color-primary": tokens.color.primary,
    "--sandy-color-secondary": tokens.color.secondary,
    "--sandy-color-border": tokens.color.border,
    "--sandy-color-muted": tokens.color.muted,
    "--sandy-color-accent": tokens.color.accent,
    "--sandy-color-success": tokens.color.success,
    "--sandy-color-warning": tokens.color.warning,
    "--sandy-color-error": tokens.color.error,
    "--sandy-color-info": tokens.color.info,
    "--sandy-color-surface": tokens.color.surface,
    "--sandy-color-overlay": tokens.color.overlay,

    // Radius
    "--sandy-radius-sm": `${tokens.radius.sm}px`,
    "--sandy-radius-md": `${tokens.radius.md}px`,
    "--sandy-radius-lg": `${tokens.radius.lg}px`,
    "--sandy-radius-full": `${tokens.radius.full}px`,

    // Spacing
    "--sandy-spacing-xs": `${tokens.spacing.xs}px`,
    "--sandy-spacing-sm": `${tokens.spacing.sm}px`,
    "--sandy-spacing-md": `${tokens.spacing.md}px`,
    "--sandy-spacing-lg": `${tokens.spacing.lg}px`,
    "--sandy-spacing-xl": `${tokens.spacing.xl}px`,
    "--sandy-spacing-2xl": `${tokens.spacing["2xl"]}px`,

    // Typography — base
    "--sandy-font-family": tokens.typography.fontFamily,
    "--sandy-font-heading-weight": String(tokens.typography.headingWeight),
    "--sandy-font-body-weight": String(tokens.typography.bodyWeight),

    // Typography — font sizes
    "--sandy-font-size-xs": `${tokens.typography.fontSize.xs}px`,
    "--sandy-font-size-sm": `${tokens.typography.fontSize.sm}px`,
    "--sandy-font-size-md": `${tokens.typography.fontSize.md}px`,
    "--sandy-font-size-lg": `${tokens.typography.fontSize.lg}px`,
    "--sandy-font-size-xl": `${tokens.typography.fontSize.xl}px`,
    "--sandy-font-size-2xl": `${tokens.typography.fontSize["2xl"]}px`,

    // Typography — line heights
    "--sandy-line-height-tight": String(tokens.typography.lineHeight.tight),
    "--sandy-line-height-normal": String(tokens.typography.lineHeight.normal),
    "--sandy-line-height-relaxed": String(tokens.typography.lineHeight.relaxed),

    // Typography — letter spacing
    "--sandy-letter-spacing-tight": tokens.typography.letterSpacing.tight,
    "--sandy-letter-spacing-normal": tokens.typography.letterSpacing.normal,
    "--sandy-letter-spacing-wide": tokens.typography.letterSpacing.wide,

    // Shadows
    "--sandy-shadow-sm": tokens.shadow.sm,
    "--sandy-shadow-md": tokens.shadow.md,
    "--sandy-shadow-lg": tokens.shadow.lg,

    // Opacity
    "--sandy-opacity-disabled": String(tokens.opacity.disabled),
    "--sandy-opacity-hover": String(tokens.opacity.hover),
    "--sandy-opacity-overlay": String(tokens.opacity.overlay),

    // Borders
    "--sandy-border-thin": tokens.border.thin,
    "--sandy-border-thick": tokens.border.thick,
  };
}

export function applyTheme(tokens: ThemeTokens, element: HTMLElement): void {
  const vars = tokensToCSSVars(tokens);
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}
