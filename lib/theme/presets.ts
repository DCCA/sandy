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
    },
    radius: { sm: 8, md: 14, lg: 20 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
    typography: {
      fontFamily: "'Inter', system-ui, sans-serif",
      headingWeight: 700,
      bodyWeight: 400,
    },
    shadow: {
      sm: "0 1px 3px rgba(0,40,100,0.06)",
      md: "0 4px 12px rgba(0,40,100,0.10)",
    },
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
    },
    radius: { sm: 4, md: 8, lg: 12 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
    typography: {
      fontFamily: "'Georgia', serif",
      headingWeight: 700,
      bodyWeight: 400,
    },
    shadow: {
      sm: "0 1px 3px rgba(0,0,0,0.04)",
      md: "0 2px 8px rgba(0,0,0,0.08)",
    },
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
    },
    radius: { sm: 8, md: 14, lg: 24 },
    spacing: { xs: 4, sm: 8, md: 16, lg: 24 },
    typography: {
      fontFamily: "'SF Mono', 'Fira Code', monospace",
      headingWeight: 600,
      bodyWeight: 400,
    },
    shadow: {
      sm: "0 1px 4px rgba(0,0,0,0.3)",
      md: "0 4px 16px rgba(0,0,0,0.4)",
    },
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
