export type ThemeTokens = {
  color: {
    background: string;
    foreground: string;
    primary: string;
    secondary: string;
    border: string;
    muted: string;
    accent: string;
  };
  radius: {
    sm: number;
    md: number;
    lg: number;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
  };
  typography: {
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
  };
  shadow: {
    sm: string;
    md: string;
  };
};

export type ThemePreset = {
  id: string;
  name: string;
  tokens: ThemeTokens;
};

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};
