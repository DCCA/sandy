import type { ThemeTokens } from "@/lib/theme/types";
import { tokensToCSSVars } from "@/lib/theme/css-vars";

export function generateHTML(previewHTML: string, tokens: ThemeTokens): string {
  const vars = tokensToCSSVars(tokens);
  const cssVarBlock = Object.entries(vars)
    .map(([key, value]) => `      ${key}: ${value};`)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sandy Export</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; }
    body {
${cssVarBlock}
      background-color: var(--sandy-color-background);
      color: var(--sandy-color-foreground);
      font-family: var(--sandy-font-family);
    }
  </style>
</head>
<body>
${previewHTML}
</body>
</html>`;
}
