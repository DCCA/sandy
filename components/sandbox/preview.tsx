"use client";

import { useEffect, useRef } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Layout } from "lucide-react";
import type { ValidatedSection } from "@/lib/registry/types";
import type { ThemeTokens } from "@/lib/theme/types";
import { applyTheme } from "@/lib/theme/css-vars";

type PreviewProps = {
  sections: ValidatedSection[];
  themeTokens: ThemeTokens;
  selectedSectionId?: string | null;
  onSectionClick?: (id: string) => void;
  onContentRef?: (el: HTMLDivElement | null) => void;
};

function SectionErrorFallback({
  error,
  resetErrorBoundary,
  sectionLabel,
}: {
  error: unknown;
  resetErrorBoundary: () => void;
  sectionLabel: string;
}) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
        <span className="text-red-400 text-lg">!</span>
      </div>
      <div className="text-red-400 text-sm font-semibold mb-1">{sectionLabel}</div>
      <p className="text-xs text-muted-foreground mb-4 max-w-md font-mono">
        {message}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="px-3 py-1.5 text-xs bg-secondary rounded-md hover:bg-secondary/80 transition-colors"
      >
        Retry
      </button>
    </div>
  );
}

function DeviceFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg overflow-hidden shadow-2xl shadow-black/20 border border-white/[0.04]">
      {/* Browser chrome */}
      <div className="h-7 bg-[#171717] border-b border-white/[0.04] flex items-center px-3 gap-1.5">
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="size-2.5 rounded-full bg-white/10" />
      </div>
      {children}
    </div>
  );
}

export function Preview({
  sections,
  themeTokens,
  selectedSectionId,
  onSectionClick,
  onContentRef,
}: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      applyTheme(themeTokens, containerRef.current);
    }
  }, [themeTokens]);

  if (sections.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Layout className="size-10 opacity-20" />
        <div className="text-center">
          <p className="text-sm font-medium">Empty page</p>
          <p className="text-xs opacity-60 mt-1">Add a section from the toolbar to get started</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center h-full overflow-auto dot-grid p-6">
      <div
        className="h-fit"
        style={{
          width: "375px",
          maxWidth: "100%",
        }}
      >
        <DeviceFrame>
          <div
            ref={(node) => {
              containerRef.current = node;
              onContentRef?.(node);
            }}
            style={{
              backgroundColor: "var(--sandy-color-background, #fff)",
              color: "var(--sandy-color-foreground, #111)",
            }}
          >
            {sections.map((section, i) => {
              const Component = section.component;
              const label = `Section ${i + 1} (${section.componentName})`;
              const isSelected = selectedSectionId === section.id;
              return (
                <ErrorBoundary
                  key={section.id}
                  fallbackRender={(props) => (
                    <SectionErrorFallback {...props} sectionLabel={label} />
                  )}
                  resetKeys={[section.id, JSON.stringify(section.props)]}
                >
                  <div
                    style={{
                      padding: "var(--sandy-spacing-lg, 24px)",
                      outline: isSelected ? "2px solid var(--sandy-color-primary, #3b82f6)" : "none",
                      outlineOffset: "-2px",
                      cursor: onSectionClick ? "pointer" : undefined,
                      position: "relative",
                    }}
                    onClick={onSectionClick ? () => onSectionClick(section.id) : undefined}
                  >
                    <Component {...section.props} />
                  </div>
                </ErrorBoundary>
              );
            })}
          </div>
        </DeviceFrame>
      </div>
    </div>
  );
}
