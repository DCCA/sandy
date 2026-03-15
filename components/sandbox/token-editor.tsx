"use client";

import { useState, useCallback } from "react";
import { Paintbrush, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ThemeTokens, DeepPartial } from "@/lib/theme/types";

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
  { key: "border", label: "Border" },
  { key: "muted", label: "Muted" },
];

const RADIUS_LABELS: { key: keyof ThemeTokens["radius"]; label: string }[] = [
  { key: "sm", label: "Small" },
  { key: "md", label: "Medium" },
  { key: "lg", label: "Large" },
];

const SPACING_LABELS: { key: keyof ThemeTokens["spacing"]; label: string }[] = [
  { key: "xs", label: "XS" },
  { key: "sm", label: "SM" },
  { key: "md", label: "MD" },
  { key: "lg", label: "LG" },
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

function ColorInput({
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
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="size-6 rounded cursor-pointer border-0 bg-transparent p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0"
      />
      <span className="font-mono text-[10px] text-muted-foreground">{value}</span>
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
  const handleColor = useCallback(
    (key: keyof ThemeTokens["color"], value: string) => {
      onOverrideChange({ ...overrides, color: { ...overrides.color, [key]: value } });
    },
    [overrides, onOverrideChange]
  );

  const handleRadius = useCallback(
    (key: keyof ThemeTokens["radius"], value: number) => {
      onOverrideChange({ ...overrides, radius: { ...overrides.radius, [key]: value } });
    },
    [overrides, onOverrideChange]
  );

  const handleSpacing = useCallback(
    (key: keyof ThemeTokens["spacing"], value: number) => {
      onOverrideChange({ ...overrides, spacing: { ...overrides.spacing, [key]: value } });
    },
    [overrides, onOverrideChange]
  );

  const handleTypography = useCallback(
    (key: keyof ThemeTokens["typography"], value: string | number) => {
      onOverrideChange({ ...overrides, typography: { ...overrides.typography, [key]: value } });
    },
    [overrides, onOverrideChange]
  );

  const handleShadow = useCallback(
    (key: keyof ThemeTokens["shadow"], value: string) => {
      onOverrideChange({ ...overrides, shadow: { ...overrides.shadow, [key]: value } });
    },
    [overrides, onOverrideChange]
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
          </Section>

          <Section title="Radius">
            {RADIUS_LABELS.map(({ key, label }) => (
              <NumberInput
                key={key}
                label={label}
                value={tokens.radius[key]}
                onChange={(v) => handleRadius(key, v)}
                max={48}
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
                max={64}
              />
            ))}
          </Section>

          <Section title="Typography" defaultOpen={false}>
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
          </Section>
        </div>
      )}
    </div>
  );
}
