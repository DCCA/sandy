"use client";

import { useState, useCallback, useRef, useEffect, memo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Smartphone,
  Tablet,
  Monitor,
  Check,
  Copy,
  RotateCcw,
  AlignLeft,
  Paintbrush,
} from "lucide-react";
import type { Viewport } from "@/lib/registry/types";
import { themePresets } from "@/lib/theme/presets";
import { getRegistryKeys, getRegistryItem } from "@/lib/registry";

type ToolbarProps = {
  selectedComponent: string;
  selectedTheme: string;
  viewport: Viewport;
  onComponentChange: (key: string) => void;
  onThemeChange: (id: string) => void;
  onViewportChange: (v: Viewport) => void;
  onFormat: () => void;
  onReset: () => void;
  onShare: () => void;
  tokenEditorOpen: boolean;
  onTokenEditorToggle: () => void;
};

export const Toolbar = memo(function Toolbar({
  selectedComponent,
  selectedTheme,
  viewport,
  onComponentChange,
  onThemeChange,
  onViewportChange,
  onFormat,
  onReset,
  onShare,
  tokenEditorOpen,
  onTokenEditorToggle,
}: ToolbarProps) {
  const componentKeys = getRegistryKeys();
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  const handleShare = useCallback(() => {
    onShare();
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  }, [onShare]);

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border/50 backdrop-blur-md bg-background/80 shrink-0">
      {/* Branding */}
      <span className="font-mono text-sm font-semibold tracking-tight text-accent-foreground mr-1">
        <span className="text-accent">S</span>andy
      </span>

      <Separator orientation="vertical" className="h-5" />

      {/* Component selector */}
      <Select value={selectedComponent} onValueChange={(v) => v && onComponentChange(v)}>
        <SelectTrigger className="w-[180px] h-8 text-xs">
          <SelectValue placeholder="Component" />
        </SelectTrigger>
        <SelectContent>
          {componentKeys.map((key) => {
            const item = getRegistryItem(key);
            return (
              <SelectItem key={key} value={key}>
                <div className="flex flex-col py-0.5">
                  <span className="font-medium">{key}</span>
                  {item?.metadata.description && (
                    <span className="text-[10px] text-muted-foreground leading-tight">
                      {item.metadata.description}
                    </span>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {/* Theme selector */}
      <Select value={selectedTheme} onValueChange={(v) => v && onThemeChange(v)}>
        <SelectTrigger className="w-[155px] h-8 text-xs">
          <SelectValue placeholder="Theme" />
        </SelectTrigger>
        <SelectContent>
          {themePresets.map((preset) => (
            <SelectItem key={preset.id} value={preset.id}>
              <div className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full shrink-0 ring-1 ring-white/10"
                  style={{ backgroundColor: preset.tokens.color.primary }}
                />
                <span>{preset.name}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Separator orientation="vertical" className="h-5" />

      {/* Viewport toggle with icons */}
      <Tabs value={viewport} onValueChange={(v) => v && onViewportChange(v as Viewport)}>
        <TabsList className="h-8">
          <TabsTrigger value="mobile" className="px-2.5 h-7" title="Mobile (375px)">
            <Smartphone className="size-3.5" />
          </TabsTrigger>
          <TabsTrigger value="tablet" className="px-2.5 h-7" title="Tablet (768px)">
            <Tablet className="size-3.5" />
          </TabsTrigger>
          <TabsTrigger value="desktop" className="px-2.5 h-7" title="Desktop (100%)">
            <Monitor className="size-3.5" />
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          className={`h-7 px-2 ${tokenEditorOpen ? "text-accent" : ""}`}
          onClick={onTokenEditorToggle}
          title="Design tokens"
        >
          <Paintbrush className="size-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onFormat} title="Format JSON">
          <AlignLeft className="size-3.5" />
        </Button>
        <Button variant="ghost" size="sm" className="h-7 px-2" onClick={onReset} title="Reset to template">
          <RotateCcw className="size-3.5" />
        </Button>

        <Separator orientation="vertical" className="h-5 mx-1" />

        <Button
          variant="secondary"
          size="sm"
          className="h-7 px-2.5 text-xs gap-1.5"
          onClick={handleShare}
          title="Copy shareable URL"
        >
          {copied ? (
            <>
              <Check className="size-3.5 text-green-400" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="size-3.5" />
              Share
            </>
          )}
        </Button>
      </div>
    </div>
  );
});
