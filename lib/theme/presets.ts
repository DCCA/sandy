import type { ThemePreset } from "./types";

export const defaultTheme: ThemePreset = {
  id: "default",
  name: "Default",
  tokens: {
    color: {
      background: "#E5F1FA",
      foreground: "#1A2B3C",
      primary: "#0066CC",
      secondary: "#FFFFFF",
      border: "#D0E2F0",
      muted: "#6B8299",
      accent: "#00A86B",
      success: "#00A86B",
      warning: "#E6A800",
      error: "#DC2626",
      info: "#0066CC",
      surface: "#F0F6FC",
      overlay: "rgba(0,0,0,0.4)",
    },
    radius: { sm: 8, md: 14, lg: 20, full: 999 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48 },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      headingWeight: 700,
      bodyWeight: 400,
      fontSize: { xs: 11, sm: 13, md: 15, lg: 18, xl: 22, "2xl": 30 },
      lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
      letterSpacing: { tight: "-0.02em", normal: "0em", wide: "0.02em" },
    },
    shadow: {
      sm: "0 1px 3px rgba(0,40,100,0.06)",
      md: "0 4px 12px rgba(0,40,100,0.10)",
      lg: "0 8px 24px rgba(0,40,100,0.14)",
    },
    opacity: { disabled: 0.4, hover: 0.8, overlay: 0.5 },
    border: { thin: "1px", thick: "2px" },
  },
};

export const acmeBankTheme: ThemePreset = {
  id: "acme-bank",
  name: "Acme Bank",
  tokens: {
    color: {
      background: "#fafbfc",
      foreground: "#1a1a2e",
      primary: "#003366",
      secondary: "#e8edf2",
      border: "#c8d1da",
      muted: "#5a6677",
      accent: "#00509e",
      success: "#1a7a4c",
      warning: "#b8860b",
      error: "#b91c1c",
      info: "#003366",
      surface: "#f0f2f5",
      overlay: "rgba(0,0,0,0.5)",
    },
    radius: { sm: 4, md: 8, lg: 12, full: 999 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48 },
    typography: {
      fontFamily: "'Georgia', serif",
      headingWeight: 700,
      bodyWeight: 400,
      fontSize: { xs: 11, sm: 13, md: 15, lg: 18, xl: 22, "2xl": 28 },
      lineHeight: { tight: 1.25, normal: 1.5, relaxed: 1.75 },
      letterSpacing: { tight: "-0.01em", normal: "0em", wide: "0.03em" },
    },
    shadow: {
      sm: "0 1px 3px rgba(0,0,0,0.04)",
      md: "0 2px 8px rgba(0,0,0,0.08)",
      lg: "0 6px 20px rgba(0,0,0,0.12)",
    },
    opacity: { disabled: 0.4, hover: 0.8, overlay: 0.5 },
    border: { thin: "1px", thick: "2px" },
  },
};

export const enterpriseDarkTheme: ThemePreset = {
  id: "enterprise-dark",
  name: "Enterprise Dark",
  tokens: {
    color: {
      background: "#0a0a0a",
      foreground: "#ededed",
      primary: "#22d3ee",
      secondary: "#1c1c1e",
      border: "#2a2a2e",
      muted: "#a1a1aa",
      accent: "#22d3ee",
      success: "#34d399",
      warning: "#fbbf24",
      error: "#f87171",
      info: "#22d3ee",
      surface: "#141416",
      overlay: "rgba(0,0,0,0.6)",
    },
    radius: { sm: 8, md: 14, lg: 24, full: 999 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, "2xl": 48 },
    typography: {
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      headingWeight: 600,
      bodyWeight: 400,
      fontSize: { xs: 11, sm: 12, md: 14, lg: 17, xl: 21, "2xl": 28 },
      lineHeight: { tight: 1.2, normal: 1.5, relaxed: 1.7 },
      letterSpacing: { tight: "-0.01em", normal: "0em", wide: "0.05em" },
    },
    shadow: {
      sm: "0 1px 4px rgba(0,0,0,0.3)",
      md: "0 4px 16px rgba(0,0,0,0.4)",
      lg: "0 8px 32px rgba(0,0,0,0.5)",
    },
    opacity: { disabled: 0.35, hover: 0.75, overlay: 0.6 },
    border: { thin: "1px", thick: "2px" },
  },
};

export const themePresets: ThemePreset[] = [
  defaultTheme,
  acmeBankTheme,
  enterpriseDarkTheme,
];

export function getThemePreset(id: string): ThemePreset | undefined {
  return themePresets.find((t) => t.id === id);
}
