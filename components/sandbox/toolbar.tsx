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
import { Separator } from "@/components/ui/separator";
import {
  Check,
  Copy,
  RotateCcw,
  AlignLeft,
  Paintbrush,
  Plus,
  FileText,
  Puzzle,
  Pencil,
  Trash2,
  Undo2,
  Redo2,
} from "lucide-react";
import type { CompositeDefinition } from "@/lib/composite/types";
import { themePresets } from "@/lib/theme/presets";
import { getRegistryKeys, getRegistryItem } from "@/lib/registry";
import { pageTemplates } from "@/lib/registry/templates";
import { ExportPanel } from "./export-panel";
import { SandyLogo } from "@/components/sandy-logo";

type ToolbarProps = {
  selectedTheme: string;
  onAddSection: (componentKey: string) => void;
  onLoadTemplate: (templateId: string) => void;
  onThemeChange: (id: string) => void;
  onFormat: () => void;
  onReset: () => void;
  onShare: () => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onExportJSON: () => void;
  onExportReact: () => string;
  onExportHTML: () => string;
  tokenEditorOpen: boolean;
  onTokenEditorToggle: () => void;
  composites?: CompositeDefinition[];
  onCreateComponent?: () => void;
  onEditComposite?: (def: CompositeDefinition) => void;
  onDeleteComposite?: (id: string) => void;
};

export const Toolbar = memo(function Toolbar({
  selectedTheme,
  onAddSection,
  onLoadTemplate,
  onThemeChange,
  onFormat,
  onReset,
  onShare,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onExportJSON,
  onExportReact,
  onExportHTML,
  tokenEditorOpen,
  onTokenEditorToggle,
  composites = [],
  onCreateComponent,
  onEditComposite,
  onDeleteComposite,
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
      <SandyLogo className="mr-1" />

      <Separator orientation="vertical" className="h-5" />

      {/* Add Section */}
      <Select value="" onValueChange={(v) => v && onAddSection(v)}>
        <SelectTrigger className="w-[160px] h-8 text-xs">
          <div className="flex items-center gap-1.5">
            <Plus className="size-3.5" />
            <span>Add Section</span>
          </div>
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

      {/* Templates */}
      <Select value="" onValueChange={(v) => v && onLoadTemplate(v)}>
        <SelectTrigger className="w-[140px] h-8 text-xs">
          <div className="flex items-center gap-1.5">
            <FileText className="size-3.5" />
            <span>Templates</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {pageTemplates.map((tpl) => (
            <SelectItem key={tpl.id} value={tpl.id}>
              <div className="flex flex-col py-0.5">
                <span className="font-medium">{tpl.name}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">
                  {tpl.description}
                </span>
              </div>
            </SelectItem>
          ))}
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

      {/* Actions */}
      <div className="ml-auto flex items-center gap-1">
        {/* Create Component button */}
        {onCreateComponent && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 gap-1.5 text-xs"
            onClick={onCreateComponent}
            title="Create custom component"
          >
            <Puzzle className="size-3.5" />
            <span className="hidden xl:inline">Create</span>
          </Button>
        )}

        {/* Custom components management */}
        {composites.length > 0 && onEditComposite && onDeleteComposite && (
          <div className="flex items-center gap-0.5">
            {composites.map((def) => (
              <div key={def.id} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-muted/30 text-[10px] font-mono">
                <span className="truncate max-w-[80px]">{def.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0"
                  onClick={() => onEditComposite(def)}
                  title={`Edit ${def.name}`}
                >
                  <Pencil className="size-2.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 text-red-400 hover:text-red-300"
                  onClick={() => onDeleteComposite(def.id)}
                  title={`Delete ${def.name}`}
                >
                  <Trash2 className="size-2.5" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={onUndo}
          disabled={!canUndo}
          title="Undo (Ctrl+Z)"
        >
          <Undo2 className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 px-2"
          onClick={onRedo}
          disabled={!canRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          <Redo2 className="size-3.5" />
        </Button>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

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

        <ExportPanel
          onExportJSON={onExportJSON}
          onExportReact={onExportReact}
          onExportHTML={onExportHTML}
        />

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
