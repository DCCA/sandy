"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Download, Code, FileCode, Copy, Check, X } from "lucide-react";

type ExportFormat = "json" | "react" | "html";

type ExportPanelProps = {
  onExportJSON: () => void;
  onExportReact: () => string;
  onExportHTML: () => string;
};

export function ExportPanel({ onExportJSON, onExportReact, onExportHTML }: ExportPanelProps) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<{ format: ExportFormat; code: string } | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
        setPreview(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const handleCopy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard permission denied
    }
  }, []);

  const handleDownload = useCallback((content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 gap-1.5 text-xs"
        onClick={() => setOpen((prev) => !prev)}
        title="Export"
      >
        <Download className="size-3.5" />
        <span className="hidden xl:inline">Export</span>
      </Button>

      {open && (
        <div className="absolute right-0 top-full mt-1 z-50 w-[480px] max-h-[400px] rounded-lg border border-border/50 bg-popover shadow-xl flex flex-col overflow-hidden">
          {!preview ? (
            <div className="p-2 space-y-1">
              <button
                className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-left"
                onClick={() => { onExportJSON(); setOpen(false); }}
              >
                <Download className="size-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">Download JSON</div>
                  <div className="text-xs text-muted-foreground">Save page definition as .json file</div>
                </div>
              </button>
              <button
                className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-left"
                onClick={() => setPreview({ format: "react", code: onExportReact() })}
              >
                <Code className="size-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">React JSX</div>
                  <div className="text-xs text-muted-foreground">Generate a React component file</div>
                </div>
              </button>
              <button
                className="flex items-center gap-3 w-full px-3 py-2 rounded-md text-sm hover:bg-muted/50 transition-colors text-left"
                onClick={() => setPreview({ format: "html", code: onExportHTML() })}
              >
                <FileCode className="size-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">HTML Snapshot</div>
                  <div className="text-xs text-muted-foreground">Standalone HTML with inlined theme</div>
                </div>
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
                <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {preview.format === "react" ? "React JSX" : "HTML"}
                </span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 gap-1 text-xs"
                    onClick={() => handleCopy(preview.code)}
                  >
                    {copied ? <Check className="size-3 text-green-400" /> : <Copy className="size-3" />}
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 gap-1 text-xs"
                    onClick={() =>
                      handleDownload(
                        preview.code,
                        preview.format === "react" ? "page.tsx" : "page.html",
                        preview.format === "react" ? "text/typescript" : "text/html",
                      )
                    }
                  >
                    <Download className="size-3" />
                    Save
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => { setPreview(null); setCopied(false); }}
                  >
                    <X className="size-3" />
                  </Button>
                </div>
              </div>
              <pre className="flex-1 overflow-auto p-3 text-xs font-mono whitespace-pre text-muted-foreground bg-muted/20">
                {preview.code}
              </pre>
            </>
          )}
        </div>
      )}
    </div>
  );
}
