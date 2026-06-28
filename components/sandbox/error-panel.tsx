"use client";

import { useState, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import type { SandboxError } from "@/lib/registry/types";

type ErrorPanelProps = {
  errors: SandboxError[];
};

const errorBorderColors: Record<SandboxError["type"], string> = {
  parse: "border-l-red-500",
  validation: "border-l-amber-500",
  runtime: "border-l-red-600",
};

const errorLabels: Record<SandboxError["type"], string> = {
  parse: "Parse Error",
  validation: "Validation Error",
  runtime: "Runtime Error",
};

const errorDotColors: Record<SandboxError["type"], string> = {
  parse: "bg-red-500",
  validation: "bg-amber-500",
  runtime: "bg-red-600",
};

export function ErrorPanel({ errors }: ErrorPanelProps) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const toggleCollapse = useCallback((key: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  if (errors.length === 0) {
    return (
      <div className="px-3 py-2 border-t border-border/50 text-xs flex items-center gap-2 font-mono shrink-0">
        <span className="size-2 rounded-full bg-green-500 animate-pulse" />
        <span className="text-green-400/80">Valid</span>
      </div>
    );
  }

  return (
    <div className="border-t border-border/50 overflow-auto max-h-[220px] transition-all duration-200 shrink-0">
      <div className="p-2 space-y-1.5">
        {errors.map((err, i) => {
          const key = err.sectionId ? `${err.type}-${err.sectionId}` : `${err.type}-${i}`;
          const isCollapsed = collapsed.has(key);
          const label = err.sectionLabel
            ? `${errorLabels[err.type]} — ${err.sectionLabel}`
            : errorLabels[err.type];

          return (
            <div
              key={key}
              className={`border-l-4 ${errorBorderColors[err.type]} bg-muted/20 rounded-r-md overflow-hidden`}
            >
              <button
                type="button"
                onClick={() => toggleCollapse(key)}
                className="flex items-center gap-2 w-full px-3 py-1.5 text-left hover:bg-muted/30 transition-colors"
              >
                {isCollapsed ? (
                  <ChevronRight className="size-3 text-muted-foreground shrink-0" />
                ) : (
                  <ChevronDown className="size-3 text-muted-foreground shrink-0" />
                )}
                <span className={`size-1.5 rounded-full ${errorDotColors[err.type]} shrink-0`} />
                <span className="text-xs font-semibold text-muted-foreground truncate">
                  {label}
                </span>
                <span className="text-[10px] text-muted-foreground/60 ml-auto shrink-0">
                  {err.messages.length} {err.messages.length === 1 ? "issue" : "issues"}
                </span>
              </button>
              <div
                className="grid transition-all duration-200"
                style={{
                  gridTemplateRows: isCollapsed ? "0fr" : "1fr",
                }}
              >
                <div className="overflow-hidden">
                  <ul className="px-3 pb-2 space-y-0.5">
                    {err.messages.map((msg, j) => (
                      <li
                        key={j}
                        className="text-[11px] text-muted-foreground font-mono leading-relaxed"
                      >
                        {msg}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
