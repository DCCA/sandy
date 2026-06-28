"use client";

import { useState, useCallback, useRef } from "react";
import { Paintbrush, ChevronDown, ChevronRight, RotateCcw, Download, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemeTokens, DeepPartial } from "@/lib/theme/types";
import { tokensToDTCGString, dtcgToOverrides } from "@/lib/theme/dtcg";
import { downloadJSON } from "@/lib/export/json";

type TokenEditorProps = {
  tokens: ThemeTokens;
  overrides: DeepPartial<ThemeTokens>;
  onOverrideChange: (o: DeepPartial<ThemeTokens>) => void;
  onReset: () => void;
  isOpen: boolean;
  onToggle: () => void;
};

const COLOR_LABELS: { key: keyof ThemeTokens["color"]; label: string }[] = [
  { key: "primary", label: "Primary" },
  { key: "accent", label: "Accent" },
  { key: "background", label: "Background" },
  { key: "foreground", label: "Foreground" },
  { key: "secondary", label: "Secondary" },
  { key: "surface", label: "Surface" },
  { key: "border", label: "Border" },
  { key: "muted", label: "Muted" },
  { key: "success", label: "Success" },
  { key: "warning", label: "Warning" },
  { key: "error", label: "Error" },
  { key: "info", label: "Info" },
];

const RADIUS_LABELS: { key: keyof ThemeTokens["radius"]; label: string }[] = [
  { key: "sm", label: "Small" },
  { key: "md", label: "Medium" },
  { key: "lg", label: "Large" },
  { key: "full", label: "Full" },
];

const SPACING_LABELS: { key: keyof ThemeTokens["spacing"]; label: string }[] = [
  { key: "xs", label: "XS" },
  { key: "sm", label: "SM" },
  { key: "md", label: "MD" },
  { key: "lg", label: "LG" },
  { key: "xl", label: "XL" },
  { key: "2xl", label: "2XL" },
];

const FONT_SIZE_LABELS: { key: keyof ThemeTokens["typography"]["fontSize"]; label: string }[] = [
  { key: "xs", label: "XS" },
  { key: "sm", label: "SM" },
  { key: "md", label: "MD" },
  { key: "lg", label: "LG" },
  { key: "xl", label: "XL" },
  { key: "2xl", label: "2XL" },
];

const LINE_HEIGHT_LABELS: { key: keyof ThemeTokens["typography"]["lineHeight"]; label: string }[] =
  [
    { key: "tight", label: "Tight" },
    { key: "normal", label: "Normal" },
    { key: "relaxed", label: "Relaxed" },
  ];

const LETTER_SPACING_LABELS: {
  key: keyof ThemeTokens["typography"]["letterSpacing"];
  label: string;
}[] = [
  { key: "tight", label: "Tight" },
  { key: "normal", label: "Normal" },
  { key: "wide", label: "Wide" },
];

const OPACITY_LABELS: { key: keyof ThemeTokens["opacity"]; label: string }[] = [
  { key: "disabled", label: "Disabled" },
  { key: "hover", label: "Hover" },
  { key: "overlay", label: "Overlay" },
];

function Section({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border/30 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 w-full px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        {open ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
        {title}
      </button>
      <div
        className="grid transition-all duration-200"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <div className="px-3 pb-3 space-y-2">{children}</div>
        </div>
      </div>
    </div>
  );
}

function Subsection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <span className="text-[10px] font-medium text-muted-foreground/70 uppercase tracking-wider">
        {title}
      </span>
      {children}
    </div>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const isHex = value.startsWith("#");
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-muted-foreground w-20 shrink-0">{label}</label>
      {isHex ? (
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="size-6 rounded cursor-pointer border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
        />
      ) : (
        <div className="size-6 rounded border border-border/50" style={{ background: value }} />
      )}
      <span className="font-mono text-[10px] text-muted-foreground truncate">{value}</span>
    </div>
  );
}

function NumberInput({
  label,
  value,
  onChange,
  suffix = "px",
  min = 0,
  max = 100,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-muted-foreground w-20 shrink-0">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        step={step}
        className="h-6 w-16 rounded bg-muted/30 border border-border/50 px-2 font-mono text-[11px] text-foreground outline-none focus:border-accent/50"
      />
      <span className="text-[10px] text-muted-foreground">{suffix}</span>
    </div>
  );
}

function TextInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-[11px] text-muted-foreground w-20 shrink-0">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-6 flex-1 min-w-0 rounded bg-muted/30 border border-border/50 px-2 font-mono text-[11px] text-foreground outline-none focus:border-accent/50"
      />
    </div>
  );
}

export function TokenEditor({
  tokens,
  overrides,
  onOverrideChange,
  onReset,
  isOpen,
  onToggle,
}: TokenEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Export the *effective* tokens (base + current overrides) as a W3C DTCG
  // .tokens.json file for use in Figma / Style Dictionary / Tokens Studio.
  const handleExportDTCG = useCallback(() => {
    downloadJSON(tokensToDTCGString(tokens), "sandy-theme.tokens.json");
  }, [tokens]);

  const handleImportDTCG = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = ""; // allow re-importing the same file
      if (!file) return;
      try {
        const parsed = dtcgToOverrides(JSON.parse(await file.text()));
        if (parsed) onOverrideChange(parsed);
      } catch {
        // Ignore unreadable/invalid files.
      }
    },
    [onOverrideChange],
  );

  const handleColor = useCallback(
    (key: keyof ThemeTokens["color"], value: string) => {
      onOverrideChange({ ...overrides, color: { ...overrides.color, [key]: value } });
    },
    [overrides, onOverrideChange],
  );

  const handleRadius = useCallback(
    (key: keyof ThemeTokens["radius"], value: number) => {
      onOverrideChange({ ...overrides, radius: { ...overrides.radius, [key]: value } });
    },
    [overrides, onOverrideChange],
  );

  const handleSpacing = useCallback(
    (key: keyof ThemeTokens["spacing"], value: number) => {
      onOverrideChange({ ...overrides, spacing: { ...overrides.spacing, [key]: value } });
    },
    [overrides, onOverrideChange],
  );

  const handleTypography = useCallback(
    (key: "fontFamily" | "headingWeight" | "bodyWeight", value: string | number) => {
      onOverrideChange({ ...overrides, typography: { ...overrides.typography, [key]: value } });
    },
    [overrides, onOverrideChange],
  );

  const handleFontSize = useCallback(
    (key: keyof ThemeTokens["typography"]["fontSize"], value: number) => {
      const existing = overrides.typography?.fontSize ?? {};
      onOverrideChange({
        ...overrides,
        typography: { ...overrides.typography, fontSize: { ...existing, [key]: value } },
      });
    },
    [overrides, onOverrideChange],
  );

  const handleLineHeight = useCallback(
    (key: keyof ThemeTokens["typography"]["lineHeight"], value: number) => {
      const existing = overrides.typography?.lineHeight ?? {};
      onOverrideChange({
        ...overrides,
        typography: { ...overrides.typography, lineHeight: { ...existing, [key]: value } },
      });
    },
    [overrides, onOverrideChange],
  );

  const handleLetterSpacing = useCallback(
    (key: keyof ThemeTokens["typography"]["letterSpacing"], value: string) => {
      const existing = overrides.typography?.letterSpacing ?? {};
      onOverrideChange({
        ...overrides,
        typography: { ...overrides.typography, letterSpacing: { ...existing, [key]: value } },
      });
    },
    [overrides, onOverrideChange],
  );

  const handleShadow = useCallback(
    (key: keyof ThemeTokens["shadow"], value: string) => {
      onOverrideChange({ ...overrides, shadow: { ...overrides.shadow, [key]: value } });
    },
    [overrides, onOverrideChange],
  );

  const handleOpacity = useCallback(
    (key: keyof ThemeTokens["opacity"], value: number) => {
      onOverrideChange({ ...overrides, opacity: { ...overrides.opacity, [key]: value } });
    },
    [overrides, onOverrideChange],
  );

  const handleBorder = useCallback(
    (key: keyof ThemeTokens["border"], value: string) => {
      onOverrideChange({ ...overrides, border: { ...overrides.border, [key]: value } });
    },
    [overrides, onOverrideChange],
  );

  const hasOverrides = Object.keys(overrides).length > 0;

  return (
    <div className="flex shrink-0">
      {/* Toggle button */}
      <div className="flex flex-col border-l border-border/50">
        <button
          type="button"
          onClick={onToggle}
          className={`p-2 hover:bg-muted/30 transition-colors ${isOpen ? "text-accent" : "text-muted-foreground"}`}
          title="Design tokens"
        >
          <Paintbrush className="size-4" />
        </button>
      </div>

      {/* Panel */}
      {isOpen && (
        <div className="w-64 border-l border-border/50 bg-background/95 backdrop-blur-md overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/30">
            <span className="text-xs font-semibold text-muted-foreground">Design Tokens</span>
            <div className="flex items-center gap-0.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] gap-1"
                onClick={handleExportDTCG}
                title="Export as W3C DTCG .tokens.json"
              >
                <Download className="size-3" />
                DTCG
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] gap-1"
                onClick={() => fileInputRef.current?.click()}
                title="Import DTCG .tokens.json"
              >
                <Upload className="size-3" />
              </Button>
              {hasOverrides && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-5 px-1.5 text-[10px] gap-1"
                  onClick={onReset}
                >
                  <RotateCcw className="size-3" />
                  Reset
                </Button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={handleImportDTCG}
            />
          </div>

          {/* Sections */}
          <Section title="Colors">
            {COLOR_LABELS.map(({ key, label }) => (
              <ColorInput
                key={key}
                label={label}
                value={tokens.color[key]}
                onChange={(v) => handleColor(key, v)}
              />
            ))}
            <TextInput
              label="Overlay"
              value={tokens.color.overlay}
              onChange={(v) => handleColor("overlay", v)}
            />
          </Section>

          <Section title="Typography" defaultOpen={false}>
            <Subsection title="Base">
              <TextInput
                label="Font"
                value={tokens.typography.fontFamily}
                onChange={(v) => handleTypography("fontFamily", v)}
              />
              <NumberInput
                label="Heading wt"
                value={tokens.typography.headingWeight}
                onChange={(v) => handleTypography("headingWeight", v)}
                min={100}
                max={900}
                step={100}
                suffix=""
              />
              <NumberInput
                label="Body wt"
                value={tokens.typography.bodyWeight}
                onChange={(v) => handleTypography("bodyWeight", v)}
                min={100}
                max={900}
                step={100}
                suffix=""
              />
            </Subsection>
            <Subsection title="Font Sizes">
              {FONT_SIZE_LABELS.map(({ key, label }) => (
                <NumberInput
                  key={key}
                  label={label}
                  value={tokens.typography.fontSize[key]}
                  onChange={(v) => handleFontSize(key, v)}
                  min={8}
                  max={72}
                />
              ))}
            </Subsection>
            <Subsection title="Line Heights">
              {LINE_HEIGHT_LABELS.map(({ key, label }) => (
                <NumberInput
                  key={key}
                  label={label}
                  value={tokens.typography.lineHeight[key]}
                  onChange={(v) => handleLineHeight(key, v)}
                  min={0.8}
                  max={3}
                  step={0.1}
                  suffix=""
                />
              ))}
            </Subsection>
            <Subsection title="Letter Spacing">
              {LETTER_SPACING_LABELS.map(({ key, label }) => (
                <TextInput
                  key={key}
                  label={label}
                  value={tokens.typography.letterSpacing[key]}
                  onChange={(v) => handleLetterSpacing(key, v)}
                />
              ))}
            </Subsection>
          </Section>

          <Section title="Radius">
            {RADIUS_LABELS.map(({ key, label }) => (
              <NumberInput
                key={key}
                label={label}
                value={tokens.radius[key]}
                onChange={(v) => handleRadius(key, v)}
                max={key === "full" ? 999 : 48}
              />
            ))}
          </Section>

          <Section title="Spacing">
            {SPACING_LABELS.map(({ key, label }) => (
              <NumberInput
                key={key}
                label={label}
                value={tokens.spacing[key]}
                onChange={(v) => handleSpacing(key, v)}
                max={96}
              />
            ))}
          </Section>

          <Section title="Shadows" defaultOpen={false}>
            <TextInput
              label="Small"
              value={tokens.shadow.sm}
              onChange={(v) => handleShadow("sm", v)}
            />
            <TextInput
              label="Medium"
              value={tokens.shadow.md}
              onChange={(v) => handleShadow("md", v)}
            />
            <TextInput
              label="Large"
              value={tokens.shadow.lg}
              onChange={(v) => handleShadow("lg", v)}
            />
          </Section>

          <Section title="Opacity" defaultOpen={false}>
            {OPACITY_LABELS.map(({ key, label }) => (
              <NumberInput
                key={key}
                label={label}
                value={tokens.opacity[key]}
                onChange={(v) => handleOpacity(key, v)}
                min={0}
                max={1}
                step={0.05}
                suffix=""
              />
            ))}
          </Section>

          <Section title="Borders" defaultOpen={false}>
            <TextInput
              label="Thin"
              value={tokens.border.thin}
              onChange={(v) => handleBorder("thin", v)}
            />
            <TextInput
              label="Thick"
              value={tokens.border.thick}
              onChange={(v) => handleBorder("thick", v)}
            />
          </Section>
        </div>
      )}
    </div>
  );
}
