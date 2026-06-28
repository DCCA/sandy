"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, X } from "lucide-react";

type GeneratePanelProps = {
  /** Generate from the prompt. Resolves to an error message, or null on success. */
  onGenerate: (prompt: string) => Promise<string | null>;
};

export function GeneratePanel({ onGenerate }: GeneratePanelProps) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (!open) return;
    textareaRef.current?.focus();
    const handler = (e: MouseEvent) => {
      if (submitting) return; // don't close mid-generation
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, submitting]);

  const handleSubmit = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const err = await onGenerate(trimmed);
      if (err) {
        setError(err);
      } else {
        setPrompt("");
        setOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  }, [prompt, submitting, onGenerate]);

  return (
    <div className="relative" ref={panelRef}>
      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2 gap-1.5 text-xs"
        onClick={() => setOpen((prev) => !prev)}
        title="Generate a page from a prompt"
      >
        <Sparkles className="size-3.5" />
        <span>Generate</span>
      </Button>

      {open && (
        <div className="absolute left-0 top-full mt-1 z-50 w-[360px] rounded-lg border border-border/50 bg-popover shadow-xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-border/50">
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Generate from prompt
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setOpen(false)}
              disabled={submitting}
              aria-label="Close"
            >
              <X className="size-3" />
            </Button>
          </div>
          <div className="p-3 space-y-2">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
                  e.preventDefault();
                  void handleSubmit();
                }
              }}
              rows={4}
              maxLength={2000}
              disabled={submitting}
              placeholder="Describe the screen you want, e.g. “a banking home with an account header, balance card, quick actions, and a recent transactions list.”"
              className="w-full resize-none rounded-md border border-border/50 bg-background px-2.5 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            {error && <p className="text-xs text-red-400">{error}</p>}
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-muted-foreground">⌘/Ctrl + Enter</span>
              <Button
                size="sm"
                className="h-7 px-3 gap-1.5 text-xs"
                onClick={() => void handleSubmit()}
                disabled={submitting || prompt.trim().length === 0}
              >
                {submitting ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Generating…
                  </>
                ) : (
                  <>
                    <Sparkles className="size-3.5" />
                    Generate
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
