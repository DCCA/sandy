import type { ThemeTokens } from "./types";

export function tokensToCSSVars(tokens: ThemeTokens): Record<string, string> {
  return {
    "--sandy-color-background": tokens.color.background,
    "--sandy-color-foreground": tokens.color.foreground,
    "--sandy-color-primary": tokens.color.primary,
    "--sandy-color-secondary": tokens.color.secondary,
    "--sandy-color-border": tokens.color.border,
    "--sandy-color-muted": tokens.color.muted,
    "--sandy-color-accent": tokens.color.accent,
    "--sandy-radius-sm": `${tokens.radius.sm}px`,
    "--sandy-radius-md": `${tokens.radius.md}px`,
    "--sandy-radius-lg": `${tokens.radius.lg}px`,
    "--sandy-spacing-xs": `${tokens.spacing.xs}px`,
    "--sandy-spacing-sm": `${tokens.spacing.sm}px`,
    "--sandy-spacing-md": `${tokens.spacing.md}px`,
    "--sandy-spacing-lg": `${tokens.spacing.lg}px`,
    "--sandy-font-family": tokens.typography.fontFamily,
    "--sandy-font-heading-weight": String(tokens.typography.headingWeight),
    "--sandy-font-body-weight": String(tokens.typography.bodyWeight),
    "--sandy-shadow-sm": tokens.shadow.sm,
    "--sandy-shadow-md": tokens.shadow.md,
  };
}

export function applyTheme(tokens: ThemeTokens, element: HTMLElement): void {
  const vars = tokensToCSSVars(tokens);
  for (const [key, value] of Object.entries(vars)) {
    element.style.setProperty(key, value);
  }
}
