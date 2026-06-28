import type { DeepPartial, ThemeTokens } from "./types";
import { parseThemeOverrides } from "./schema";

/**
 * W3C Design Tokens Community Group (DTCG) interop.
 *
 * Exports Sandy's theme tokens to the standard `.tokens.json` shape
 * (`$type` + `$value`) so they can be consumed by Style Dictionary, Tokens
 * Studio, Figma, etc., and imports a DTCG document back into a partial token
 * override set that merges onto a base preset.
 *
 * Spec: https://www.designtokens.org/tr/drafts/format/
 */

type DTCGToken = { $type: string; $value: string | number };
type DTCGGroup = { [key: string]: DTCGToken | DTCGGroup };
export type DTCGDocument = { [group: string]: DTCGGroup };

const px = (n: number): string => `${n}px`;
const fromPx = (v: unknown): number | undefined => {
  if (typeof v === "number") return v;
  if (typeof v === "string") {
    const m = v.match(/^(-?\d+(?:\.\d+)?)px$/);
    if (m) return Number(m[1]);
    const n = Number(v);
    if (!Number.isNaN(n)) return n;
  }
  return undefined;
};

function color(value: string): DTCGToken {
  return { $type: "color", $value: value };
}
function dimension(value: number): DTCGToken {
  return { $type: "dimension", $value: px(value) };
}
function number(value: number): DTCGToken {
  return { $type: "number", $value: value };
}
function str(type: string, value: string): DTCGToken {
  return { $type: type, $value: value };
}

/** Convert a full token set to a DTCG document. */
export function tokensToDTCG(t: ThemeTokens): DTCGDocument {
  return {
    color: Object.fromEntries(Object.entries(t.color).map(([k, v]) => [k, color(v)])) as DTCGGroup,
    radius: Object.fromEntries(
      Object.entries(t.radius).map(([k, v]) => [k, dimension(v)]),
    ) as DTCGGroup,
    spacing: Object.fromEntries(
      Object.entries(t.spacing).map(([k, v]) => [k, dimension(v)]),
    ) as DTCGGroup,
    typography: {
      fontFamily: str("fontFamily", t.typography.fontFamily),
      headingWeight: { $type: "fontWeight", $value: t.typography.headingWeight },
      bodyWeight: { $type: "fontWeight", $value: t.typography.bodyWeight },
      fontSize: Object.fromEntries(
        Object.entries(t.typography.fontSize).map(([k, v]) => [k, dimension(v)]),
      ) as DTCGGroup,
      lineHeight: Object.fromEntries(
        Object.entries(t.typography.lineHeight).map(([k, v]) => [k, number(v)]),
      ) as DTCGGroup,
      letterSpacing: Object.fromEntries(
        Object.entries(t.typography.letterSpacing).map(([k, v]) => [k, str("dimension", v)]),
      ) as DTCGGroup,
    },
    shadow: Object.fromEntries(
      Object.entries(t.shadow).map(([k, v]) => [k, str("shadow", v)]),
    ) as DTCGGroup,
    opacity: Object.fromEntries(
      Object.entries(t.opacity).map(([k, v]) => [k, number(v)]),
    ) as DTCGGroup,
    border: Object.fromEntries(
      Object.entries(t.border).map(([k, v]) => [k, str("dimension", v)]),
    ) as DTCGGroup,
  };
}

/** Serialize tokens to a DTCG `.tokens.json` string. */
export function tokensToDTCGString(t: ThemeTokens): string {
  return JSON.stringify(tokensToDTCG(t), null, 2);
}

// Known token keys per group, so an imported file only contributes fields Sandy
// understands (the strict override validator rejects unknown keys outright).
const KNOWN = {
  color: [
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
  ],
  radius: ["sm", "md", "lg", "full"],
  spacing: ["xs", "sm", "md", "lg", "xl", "2xl"],
  fontSize: ["xs", "sm", "md", "lg", "xl", "2xl"],
  lineHeight: ["tight", "normal", "relaxed"],
  letterSpacing: ["tight", "normal", "wide"],
  shadow: ["sm", "md", "lg"],
  opacity: ["disabled", "hover", "overlay"],
  border: ["thin", "thick"],
} as const;

function pick<T>(obj: Record<string, T>, keys: readonly string[]): Record<string, T> {
  const out: Record<string, T> = {};
  for (const k of keys) {
    if (k in obj) out[k] = obj[k];
  }
  return out;
}

function groupValues(group: unknown): Record<string, unknown> {
  if (!group || typeof group !== "object") return {};
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(group as Record<string, unknown>)) {
    if (v && typeof v === "object" && "$value" in (v as Record<string, unknown>)) {
      out[k] = (v as DTCGToken).$value;
    }
  }
  return out;
}

/**
 * Parse a DTCG document into a validated partial token override set. Unknown
 * keys/types are dropped by the override validator, so a foreign token file
 * only contributes the fields Sandy understands.
 */
export function dtcgToOverrides(doc: unknown): DeepPartial<ThemeTokens> | null {
  if (!doc || typeof doc !== "object") return null;
  const d = doc as Record<string, unknown>;

  const mapPx = (group: unknown): Record<string, number> => {
    const raw = groupValues(group);
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw)) {
      const n = fromPx(v);
      if (n !== undefined) out[k] = n;
    }
    return out;
  };
  const mapNum = (group: unknown): Record<string, number> => {
    const raw = groupValues(group);
    const out: Record<string, number> = {};
    for (const [k, v] of Object.entries(raw)) {
      const n = typeof v === "number" ? v : Number(v);
      if (!Number.isNaN(n)) out[k] = n;
    }
    return out;
  };
  const mapStr = (group: unknown): Record<string, string> => {
    const raw = groupValues(group);
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      if (typeof v === "string") out[k] = v;
    }
    return out;
  };

  const typo = (d.typography ?? {}) as Record<string, unknown>;
  const typographyValues = groupValues(typo);

  const candidate: Record<string, unknown> = {
    color: pick(mapStr(d.color), KNOWN.color),
    radius: pick(mapPx(d.radius), KNOWN.radius),
    spacing: pick(mapPx(d.spacing), KNOWN.spacing),
    typography: {
      ...(typeof typographyValues.fontFamily === "string"
        ? { fontFamily: typographyValues.fontFamily }
        : {}),
      ...(typeof typographyValues.headingWeight === "number"
        ? { headingWeight: typographyValues.headingWeight }
        : {}),
      ...(typeof typographyValues.bodyWeight === "number"
        ? { bodyWeight: typographyValues.bodyWeight }
        : {}),
      fontSize: pick(mapPx(typo.fontSize), KNOWN.fontSize),
      lineHeight: pick(mapNum(typo.lineHeight), KNOWN.lineHeight),
      letterSpacing: pick(mapStr(typo.letterSpacing), KNOWN.letterSpacing),
    },
    shadow: pick(mapStr(d.shadow), KNOWN.shadow),
    opacity: pick(mapNum(d.opacity), KNOWN.opacity),
    border: pick(mapStr(d.border), KNOWN.border),
  };

  // Drop empty groups so we don't emit noise, then validate.
  const pruned = pruneEmpty(candidate);
  return parseThemeOverrides(pruned);
}

function pruneEmpty(obj: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      const nested = pruneEmpty(v as Record<string, unknown>);
      if (Object.keys(nested).length > 0) out[k] = nested;
    } else if (v !== undefined) {
      out[k] = v;
    }
  }
  return out;
}
