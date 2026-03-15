"use client";

import { useState, useCallback, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Editor } from "@/components/sandbox/editor";
import { Toolbar } from "@/components/sandbox/toolbar";
import { Preview } from "@/components/sandbox/preview";
import { ErrorPanel } from "@/components/sandbox/error-panel";
import { TokenEditor } from "@/components/sandbox/token-editor";
import { registry, getRegistryItem } from "@/lib/registry";
import { parseJSON } from "@/lib/sandbox/parse";
import { validateEnvelope, validateComponentProps } from "@/lib/sandbox/validate";
import { serializeState, deserializeState, serializeTokens, deserializeTokens } from "@/lib/sandbox/serialize";
import { getThemePreset, defaultTheme } from "@/lib/theme/presets";
import { mergeTokens } from "@/lib/theme/merge-tokens";
import type { Viewport, SandboxError, Envelope } from "@/lib/registry/types";
import type { DeepPartial, ThemeTokens } from "@/lib/theme/types";

const DEFAULT_COMPONENT = "HeroBanner";

function SandboxContent() {
  const searchParams = useSearchParams();
  const isToolbarUpdate = useRef(false);
  const urlSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Determine initial state from URL or defaults
  const initialState = useMemo(() => {
    const encoded = searchParams.get("s");
    const tokenParam = searchParams.get("t");
    const initialTokenOverrides = tokenParam ? deserializeTokens(tokenParam) ?? {} : {};

    if (encoded) {
      const restored = deserializeState(encoded);
      if (restored) {
        return {
          json: JSON.stringify(restored, null, 2),
          component: restored.component,
          theme: restored.theme?.brand ?? "default",
          viewport: (restored.meta?.viewport ?? "desktop") as Viewport,
          tokenOverrides: initialTokenOverrides,
        };
      }
    }
    const item = getRegistryItem(DEFAULT_COMPONENT)!;
    return {
      json: JSON.stringify(item.example, null, 2),
      component: DEFAULT_COMPONENT,
      theme: "default",
      viewport: "desktop" as Viewport,
      tokenOverrides: initialTokenOverrides,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [jsonText, setJsonText] = useState(initialState.json);
  const [selectedComponent, setSelectedComponent] = useState(initialState.component);
  const [selectedTheme, setSelectedTheme] = useState(initialState.theme);
  const [viewport, setViewport] = useState<Viewport>(initialState.viewport);
  const [tokenOverrides, setTokenOverrides] = useState<DeepPartial<ThemeTokens>>(initialState.tokenOverrides);
  const [tokenEditorOpen, setTokenEditorOpen] = useState(false);

  // Parse, validate, and derive toolbar state in one pass
  const { errors, validatedProps, resolvedComponent, parsedComponent, parsedTheme, parsedViewport } = useMemo(() => {
    const errs: SandboxError[] = [];
    const parsed = parseJSON(jsonText);
    if (!parsed.success) {
      errs.push({ type: "parse", messages: [parsed.error] });
      return { errors: errs, validatedProps: null, resolvedComponent: null, parsedComponent: null, parsedTheme: null, parsedViewport: null };
    }

    const envelopeResult = validateEnvelope(parsed.data);
    if (!envelopeResult.success) {
      errs.push({ type: "validation", messages: envelopeResult.errors });
      return { errors: errs, validatedProps: null, resolvedComponent: null, parsedComponent: null, parsedTheme: null, parsedViewport: null };
    }

    const envelope = envelopeResult.data;
    const item = getRegistryItem(envelope.component);
    if (!item) {
      errs.push({ type: "validation", messages: [`Unknown component: "${envelope.component}"`] });
      return { errors: errs, validatedProps: null, resolvedComponent: null, parsedComponent: envelope.component, parsedTheme: envelope.theme?.brand ?? null, parsedViewport: (envelope.meta?.viewport as Viewport) ?? null };
    }

    const propsResult = validateComponentProps(item.schema, envelope.props);
    if (!propsResult.success) {
      errs.push({ type: "validation", messages: propsResult.errors });
      return { errors: errs, validatedProps: null, resolvedComponent: null, parsedComponent: envelope.component, parsedTheme: envelope.theme?.brand ?? null, parsedViewport: (envelope.meta?.viewport as Viewport) ?? null };
    }

    return {
      errors: errs,
      validatedProps: propsResult.data as Record<string, unknown>,
      resolvedComponent: item.component,
      parsedComponent: envelope.component,
      parsedTheme: envelope.theme?.brand ?? null,
      parsedViewport: (envelope.meta?.viewport as Viewport) ?? null,
    };
  }, [jsonText]);

  // Sync toolbar state from parsed JSON (when edits come from the editor, not toolbar)
  useEffect(() => {
    if (isToolbarUpdate.current) {
      isToolbarUpdate.current = false;
      return;
    }
    if (parsedComponent && parsedComponent !== selectedComponent && registry[parsedComponent]) {
      setSelectedComponent(parsedComponent);
    }
    if (parsedTheme && parsedTheme !== selectedTheme) {
      setSelectedTheme(parsedTheme);
    }
    if (parsedViewport && parsedViewport !== viewport) {
      setViewport(parsedViewport);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedComponent, parsedTheme, parsedViewport]);

  // URL sync (debounced) — includes token overrides
  useEffect(() => {
    if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    urlSyncTimer.current = setTimeout(() => {
      const parsed = parseJSON(jsonText);
      if (parsed.success) {
        const encoded = serializeState(parsed.data as Envelope);
        if (encoded) {
          const url = new URL(window.location.href);
          url.searchParams.set("s", encoded);
          const hasOverrides = Object.keys(tokenOverrides).length > 0;
          if (hasOverrides) {
            url.searchParams.set("t", serializeTokens(tokenOverrides));
          } else {
            url.searchParams.delete("t");
          }
          window.history.replaceState(null, "", url.toString());
        }
      }
    }, 500);
    return () => {
      if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    };
  }, [jsonText, tokenOverrides]);

  const theme = getThemePreset(selectedTheme) ?? defaultTheme;
  const mergedTokens = useMemo(() => mergeTokens(theme.tokens, tokenOverrides), [theme.tokens, tokenOverrides]);

  const handleComponentChange = useCallback((key: string) => {
    isToolbarUpdate.current = true;
    const item = getRegistryItem(key);
    if (!item) return;
    setSelectedComponent(key);
    setJsonText(JSON.stringify(item.example, null, 2));
  }, []);

  const handleThemeChange = useCallback((id: string) => {
    isToolbarUpdate.current = true;
    setSelectedTheme(id);
    setTokenOverrides({});
    setJsonText((prev) => {
      try {
        const data = JSON.parse(prev);
        data.theme = { ...data.theme, brand: id };
        return JSON.stringify(data, null, 2);
      } catch {
        return prev;
      }
    });
  }, []);

  const handleViewportChange = useCallback((v: Viewport) => {
    isToolbarUpdate.current = true;
    setViewport(v);
    setJsonText((prev) => {
      try {
        const data = JSON.parse(prev);
        data.meta = { ...data.meta, viewport: v };
        return JSON.stringify(data, null, 2);
      } catch {
        return prev;
      }
    });
  }, []);

  const handleFormat = useCallback(() => {
    setJsonText((prev) => {
      try {
        const data = JSON.parse(prev);
        return JSON.stringify(data, null, 2);
      } catch {
        return prev;
      }
    });
  }, []);

  const handleReset = useCallback(() => {
    const item = getRegistryItem(selectedComponent);
    if (item) {
      setJsonText(JSON.stringify(item.example, null, 2));
    }
  }, [selectedComponent]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard permission denied — silently fail
    }
  }, []);

  const handleTokenEditorToggle = useCallback(() => {
    setTokenEditorOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        selectedComponent={selectedComponent}
        selectedTheme={selectedTheme}
        viewport={viewport}
        onComponentChange={handleComponentChange}
        onThemeChange={handleThemeChange}
        onViewportChange={handleViewportChange}
        onFormat={handleFormat}
        onReset={handleReset}
        onShare={handleShare}
        tokenEditorOpen={tokenEditorOpen}
        onTokenEditorToggle={handleTokenEditorToggle}
      />
      <div className="grid grid-cols-[2fr_3fr] flex-1 overflow-hidden">
        {/* Left panel: Editor + Errors */}
        <div className="flex flex-col border-r border-border/50 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Editor value={jsonText} onChange={setJsonText} componentName={selectedComponent} />
          </div>
          <ErrorPanel errors={errors} />
        </div>

        {/* Right panel: Preview + Token Editor */}
        <div className="flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Preview
              component={resolvedComponent}
              props={validatedProps ?? {}}
              themeTokens={mergedTokens}
              viewport={viewport}
              resetKey={selectedComponent}
            />
          </div>
          <TokenEditor
            tokens={mergedTokens}
            overrides={tokenOverrides}
            onOverrideChange={setTokenOverrides}
            onReset={() => setTokenOverrides({})}
            isOpen={tokenEditorOpen}
            onToggle={handleTokenEditorToggle}
          />
        </div>
      </div>
    </div>
  );
}

export default function SandboxPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen text-muted-foreground bg-background">
          Loading sandbox...
        </div>
      }
    >
      <SandboxContent />
    </Suspense>
  );
}
