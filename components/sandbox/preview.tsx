"use client";

import { useEffect, useRef, type ComponentType } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Layout } from "lucide-react";
import type { Viewport } from "@/lib/registry/types";
import type { ThemeTokens } from "@/lib/theme/types";
import { applyTheme } from "@/lib/theme/css-vars";

const viewportWidths: Record<Viewport, string> = {
  mobile: "375px",
  tablet: "768px",
  desktop: "100%",
};

type PreviewProps = {
  component: ComponentType<Record<string, unknown>> | null;
  props: Record<string, unknown>;
  themeTokens: ThemeTokens;
  viewport: Viewport;
  resetKey: string;
};

function ErrorFallback({ error, resetErrorBoundary }: { error: unknown; resetErrorBoundary: () => void }) {
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
      <div className="size-10 rounded-full bg-red-500/10 flex items-center justify-center mb-3">
        <span className="text-red-400 text-lg">!</span>
      </div>
      <div className="text-red-400 text-sm font-semibold mb-1">Component Error</div>
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
    <div className="rounded-lg overflow-hidden shadow-2xl shadow-black/20 border border-white/[0.06]">
      {/* Browser chrome */}
      <div className="h-7 bg-[#1a1a1c] border-b border-white/[0.06] flex items-center px-3 gap-1.5">
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="size-2.5 rounded-full bg-white/10" />
        <span className="size-2.5 rounded-full bg-white/10" />
      </div>
      {children}
    </div>
  );
}

export function Preview({ component: Component, props, themeTokens, viewport, resetKey }: PreviewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      applyTheme(themeTokens, containerRef.current);
    }
  }, [themeTokens]);

  if (!Component) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
        <Layout className="size-10 opacity-20" />
        <div className="text-center">
          <p className="text-sm font-medium">No component selected</p>
          <p className="text-xs opacity-60 mt-1">Choose a component from the toolbar to preview</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center h-full overflow-auto dot-grid p-6">
      <div
        className="h-fit transition-viewport"
        style={{
          width: viewportWidths[viewport],
          maxWidth: "100%",
        }}
      >
        <DeviceFrame>
          <div
            ref={containerRef}
            style={{
              backgroundColor: "var(--sandy-color-background, #fff)",
              padding: "var(--sandy-spacing-lg, 24px)",
              color: "var(--sandy-color-foreground, #111)",
            }}
          >
            <ErrorBoundary
              FallbackComponent={ErrorFallback}
              resetKeys={[resetKey]}
            >
              <Component {...props} />
            </ErrorBoundary>
          </div>
        </DeviceFrame>
      </div>
    </div>
  );
}
