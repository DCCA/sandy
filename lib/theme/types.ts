export type ThemeTokens = {
  color: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    border: string;
    muted: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    info: string;
    surface: string;
    overlay: string;
    focusRing: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
    full: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
    "2xl": number;
  };
  typography: {
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
    fontSize: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
      xl: number;
      "2xl": number;
    };
    lineHeight: {
      tight: number;
      normal: number;
      relaxed: number;
    };
    letterSpacing: {
      tight: string;
      normal: string;
      wide: string;
    };
  };
  shadow: {
    sm: string;
    md: string;
    lg: string;
  };
  opacity: {
    disabled: number;
    hover: number;
    overlay: number;
  };
  border: {
    thin: string;
    thick: string;
  };
};

export type ThemeMode = "light" | "dark";

export type ThemePreset = {
  id: string;
  name: string;
  /** Default token set for this brand. */
  tokens: ThemeTokens;
  /** Optional overrides applied when the page requests `mode: "light"`. */
  light?: DeepPartial<ThemeTokens>;
  /** Optional overrides applied when the page requests `mode: "dark"`. */
  dark?: DeepPartial<ThemeTokens>;
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
