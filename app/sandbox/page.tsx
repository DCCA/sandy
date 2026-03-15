"use client";

import { useState, useCallback, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Editor } from "@/components/sandbox/editor";
import { Toolbar } from "@/components/sandbox/toolbar";
import { Preview } from "@/components/sandbox/preview";
import { ErrorPanel } from "@/components/sandbox/error-panel";
import { TokenEditor } from "@/components/sandbox/token-editor";
import { SectionList } from "@/components/sandbox/section-list";
import { PropertyEditor } from "@/components/sandbox/property-editor";
import { ComponentBuilder } from "@/components/sandbox/component-builder";
import { getRegistryItem, defaultPage } from "@/lib/registry";
import { registerComposite, unregisterComposite } from "@/lib/registry/composite-registry";
import { pageTemplates } from "@/lib/registry/templates";
import { loadComposites, saveComposite, deleteComposite as deleteCompositeFromStorage } from "@/lib/composite/storage";
import { CompositeRenderer } from "@/components/composite/composite-renderer";
import type { CompositeDefinition } from "@/lib/composite/types";
import { useHistory } from "@/lib/sandbox/use-history";
import { parseJSON } from "@/lib/sandbox/parse";
import { validatePage, isLegacyEnvelope, migrateEnvelopeToPage } from "@/lib/sandbox/validate";
import { serializeState, deserializeState, serializeTokens, deserializeTokens } from "@/lib/sandbox/serialize";
import { getThemePreset, defaultTheme } from "@/lib/theme/presets";
import { mergeTokens } from "@/lib/theme/merge-tokens";
import { downloadJSON } from "@/lib/export/json";
import { generateReactCode } from "@/lib/export/react";
import { generateHTML } from "@/lib/export/html";
import type { Viewport, SandboxError, Page, Section } from "@/lib/registry/types";
import type { DeepPartial, ThemeTokens } from "@/lib/theme/types";

function createCompositeComponent(def: CompositeDefinition) {
  return function CompositeComp(props: Record<string, unknown>) {
    return <CompositeRenderer definition={def} props={props} />;
  };
}

function SandboxContent() {
  const searchParams = useSearchParams();
  const isToolbarUpdate = useRef(false);
  const urlSyncTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const initialState = useMemo(() => {
    const encoded = searchParams.get("s");
    const tokenParam = searchParams.get("t");
    const initialTokenOverrides = tokenParam ? deserializeTokens(tokenParam) ?? {} : {};

    if (encoded) {
      const restored = deserializeState(encoded);
      if (restored) {
        return {
          json: JSON.stringify(restored, null, 2),
          theme: restored.theme?.brand ?? "default",
          viewport: (restored.meta?.viewport ?? "desktop") as Viewport,
          tokenOverrides: initialTokenOverrides,
        };
      }
    }
    const page = defaultPage();
    return {
      json: JSON.stringify(page, null, 2),
      theme: "default",
      viewport: "desktop" as Viewport,
      tokenOverrides: initialTokenOverrides,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { value: jsonText, setValue: setJsonText, undo, redo, canUndo, canRedo } = useHistory(initialState.json);
  const [selectedTheme, setSelectedTheme] = useState(initialState.theme);
  const [viewport, setViewport] = useState<Viewport>(initialState.viewport);
  const [tokenOverrides, setTokenOverrides] = useState<DeepPartial<ThemeTokens>>(initialState.tokenOverrides);
  const [tokenEditorOpen, setTokenEditorOpen] = useState(false);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [composites, setComposites] = useState<CompositeDefinition[]>([]);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingComposite, setEditingComposite] = useState<CompositeDefinition | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  // Load composites from localStorage on mount
  useEffect(() => {
    const defs = loadComposites();
    for (const def of defs) {
      const comp = createCompositeComponent(def);
      registerComposite(def, comp);
    }
    setComposites(defs);
  }, []);

  // Parse, validate, derive state
  const { errors, validatedSections, parsedSections, parsedTheme, parsedViewport } = useMemo(() => {
    const errs: SandboxError[] = [];
    const parsed = parseJSON(jsonText);
    if (!parsed.success) {
      errs.push({ type: "parse", messages: [parsed.error] });
      return { errors: errs, validatedSections: [], parsedSections: [], parsedTheme: null, parsedViewport: null };
    }

    let data = parsed.data;

    // Auto-migrate legacy envelope
    if (isLegacyEnvelope(data)) {
      data = migrateEnvelopeToPage(data);
    }

    const pageResult = validatePage(data);
    const pageData = data as Page;

    return {
      errors: pageResult.errors,
      validatedSections: pageResult.sections,
      parsedSections: pageData.sections ?? [],
      parsedTheme: pageData.theme?.brand ?? null,
      parsedViewport: (pageData.meta?.viewport as Viewport) ?? null,
    };
  }, [jsonText]);

  // Derive selected section + registry item
  const selectedSection = useMemo(() => {
    if (!selectedSectionId) return null;
    const section = parsedSections.find((s) => s.id === selectedSectionId);
    if (!section) return null;
    const item = getRegistryItem(section.component);
    if (!item) return null;
    return { section, registryItem: item };
  }, [selectedSectionId, parsedSections]);

  // Sync toolbar state from parsed JSON
  useEffect(() => {
    if (isToolbarUpdate.current) {
      isToolbarUpdate.current = false;
      return;
    }
    if (parsedTheme && parsedTheme !== selectedTheme) {
      setSelectedTheme(parsedTheme);
    }
    if (parsedViewport && parsedViewport !== viewport) {
      setViewport(parsedViewport);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedTheme, parsedViewport]);

  // URL sync (debounced)
  useEffect(() => {
    if (urlSyncTimer.current) clearTimeout(urlSyncTimer.current);
    urlSyncTimer.current = setTimeout(() => {
      const parsed = parseJSON(jsonText);
      if (parsed.success) {
        let data = parsed.data;
        if (isLegacyEnvelope(data)) {
          data = migrateEnvelopeToPage(data);
        }
        const encoded = serializeState(data as Page);
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

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod || e.key.toLowerCase() !== "z") return;
      // Don't intercept when Monaco or other inputs are focused
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      e.preventDefault();
      if (e.shiftKey) {
        redo();
      } else {
        undo();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo]);

  const theme = getThemePreset(selectedTheme) ?? defaultTheme;
  const mergedTokens = useMemo(() => mergeTokens(theme.tokens, tokenOverrides), [theme.tokens, tokenOverrides]);

  // Generate next section ID based on existing sections
  const nextSectionId = useCallback((sections: Section[]): string => {
    const nums = sections
      .map((s) => {
        const m = s.id.match(/^sec_(\d+)$/);
        return m ? parseInt(m[1], 10) : 0;
      });
    const max = nums.length > 0 ? Math.max(...nums) : 0;
    return `sec_${max + 1}`;
  }, []);

  const handleAddSection = useCallback((componentKey: string) => {
    const item = getRegistryItem(componentKey);
    if (!item) return;
    isToolbarUpdate.current = true;
    setJsonText((prev) => {
      try {
        let data = JSON.parse(prev);
        if (isLegacyEnvelope(data)) {
          data = migrateEnvelopeToPage(data);
        }
        const sections: Section[] = data.sections ?? [];
        const newSection: Section = {
          id: nextSectionId(sections),
          component: componentKey,
          props: { ...item.example.props },
        };
        data.sections = [...sections, newSection];
        return JSON.stringify(data, null, 2);
      } catch {
        return prev;
      }
    });
  }, [nextSectionId, setJsonText]);

  const handleLoadTemplate = useCallback((templateId: string) => {
    const tpl = pageTemplates.find((t) => t.id === templateId);
    if (!tpl) return;
    isToolbarUpdate.current = true;
    const page = { ...tpl.page, theme: { brand: selectedTheme, mode: "light" as const }, meta: { viewport } };
    setJsonText(JSON.stringify(page, null, 2));
    setSelectedSectionId(null);
  }, [selectedTheme, viewport, setJsonText]);

  const handleMoveSection = useCallback((id: string, direction: "up" | "down") => {
    setJsonText((prev) => {
      try {
        const data = JSON.parse(prev);
        const sections: Section[] = data.sections ?? [];
        const idx = sections.findIndex((s: Section) => s.id === id);
        if (idx < 0) return prev;
        const swapIdx = direction === "up" ? idx - 1 : idx + 1;
        if (swapIdx < 0 || swapIdx >= sections.length) return prev;
        const next = [...sections];
        [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
        data.sections = next;
        return JSON.stringify(data, null, 2);
      } catch {
        return prev;
      }
    });
  }, [setJsonText]);

  const handleReorderSections = useCallback((orderedIds: string[]) => {
    setJsonText((prev) => {
      try {
        const data = JSON.parse(prev);
        const sections: Section[] = data.sections ?? [];
        const byId = new Map(sections.map((s) => [s.id, s]));
        const reordered = orderedIds.map((id) => byId.get(id)).filter(Boolean) as Section[];
        if (reordered.length !== sections.length) return prev;
        data.sections = reordered;
        return JSON.stringify(data, null, 2);
      } catch {
        return prev;
      }
    });
  }, [setJsonText]);

  const handleDeleteSection = useCallback((id: string) => {
    setJsonText((prev) => {
      try {
        const data = JSON.parse(prev);
        const sections: Section[] = data.sections ?? [];
        if (sections.length <= 1) return prev;
        data.sections = sections.filter((s: Section) => s.id !== id);
        return JSON.stringify(data, null, 2);
      } catch {
        return prev;
      }
    });
    if (selectedSectionId === id) {
      setSelectedSectionId(null);
    }
  }, [selectedSectionId, setJsonText]);

  const handleSectionPropsChange = useCallback((sectionId: string, newProps: Record<string, unknown>) => {
    setJsonText((prev) => {
      try {
        const data = JSON.parse(prev);
        const sections: Section[] = data.sections ?? [];
        const idx = sections.findIndex((s: Section) => s.id === sectionId);
        if (idx < 0) return prev;
        data.sections[idx] = { ...data.sections[idx], props: newProps };
        return JSON.stringify(data, null, 2);
      } catch {
        return prev;
      }
    });
  }, [setJsonText]);

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
  }, [setJsonText]);

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
  }, [setJsonText]);

  const handleFormat = useCallback(() => {
    setJsonText((prev) => {
      try {
        const data = JSON.parse(prev);
        return JSON.stringify(data, null, 2);
      } catch {
        return prev;
      }
    });
  }, [setJsonText]);

  const handleReset = useCallback(() => {
    const page = defaultPage();
    setJsonText(JSON.stringify(page, null, 2));
    setSelectedSectionId(null);
  }, [setJsonText]);

  const handleShare = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
    } catch {
      // Clipboard permission denied — silently fail
    }
  }, []);

  const handleExportJSON = useCallback(() => {
    downloadJSON(jsonText);
  }, [jsonText]);

  const handleExportReact = useCallback((): string => {
    return generateReactCode(validatedSections);
  }, [validatedSections]);

  const handleExportHTML = useCallback((): string => {
    const html = previewRef.current?.innerHTML ?? "";
    return generateHTML(html, mergedTokens);
  }, [mergedTokens]);

  const handleTokenEditorToggle = useCallback(() => {
    setTokenEditorOpen((prev) => !prev);
  }, []);

  const handleSaveComposite = useCallback((def: CompositeDefinition) => {
    const comp = createCompositeComponent(def);
    registerComposite(def, comp);
    saveComposite(def);
    setComposites((prev) => {
      const idx = prev.findIndex((d) => d.id === def.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = def;
        return next;
      }
      return [...prev, def];
    });
    setBuilderOpen(false);
    setEditingComposite(null);
  }, []);

  const handleEditComposite = useCallback((def: CompositeDefinition) => {
    setEditingComposite(def);
    setBuilderOpen(true);
  }, []);

  const handleDeleteComposite = useCallback((id: string) => {
    unregisterComposite(id);
    deleteCompositeFromStorage(id);
    setComposites((prev) => prev.filter((d) => d.id !== id));
  }, []);

  const handleOpenBuilder = useCallback(() => {
    setEditingComposite(null);
    setBuilderOpen(true);
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Toolbar
        selectedTheme={selectedTheme}
        viewport={viewport}
        onAddSection={handleAddSection}
        onLoadTemplate={handleLoadTemplate}
        onThemeChange={handleThemeChange}
        onViewportChange={handleViewportChange}
        onFormat={handleFormat}
        onReset={handleReset}
        onShare={handleShare}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
        onExportJSON={handleExportJSON}
        onExportReact={handleExportReact}
        onExportHTML={handleExportHTML}
        tokenEditorOpen={tokenEditorOpen}
        onTokenEditorToggle={handleTokenEditorToggle}
        composites={composites}
        onCreateComponent={handleOpenBuilder}
        onEditComposite={handleEditComposite}
        onDeleteComposite={handleDeleteComposite}
      />
      <div className="grid grid-cols-[2fr_3fr] flex-1 overflow-hidden">
        {/* Left panel: Section List + Tabs (Editor/Properties) + Errors */}
        <div className="flex flex-col border-r border-border/50 overflow-hidden">
          <SectionList
            sections={parsedSections}
            selectedId={selectedSectionId}
            onSelect={setSelectedSectionId}
            onMove={handleMoveSection}
            onReorder={handleReorderSections}
            onDelete={handleDeleteSection}
          />
          <Tabs defaultValue="editor" className="flex flex-col flex-1 overflow-hidden">
            <div className="border-b border-border/50 px-3 shrink-0">
              <TabsList className="h-8" variant="line">
                <TabsTrigger value="editor" className="text-xs px-3 h-7">
                  Editor
                </TabsTrigger>
                <TabsTrigger value="properties" className="text-xs px-3 h-7">
                  Properties
                </TabsTrigger>
              </TabsList>
            </div>
            <TabsContent value="editor" className="flex-1 overflow-hidden m-0">
              <Editor value={jsonText} onChange={setJsonText} sectionCount={parsedSections.length} />
            </TabsContent>
            <TabsContent value="properties" className="flex-1 overflow-hidden m-0">
              {selectedSection ? (
                <PropertyEditor
                  section={selectedSection.section}
                  registryItem={selectedSection.registryItem}
                  onChange={handleSectionPropsChange}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground px-4">
                  <p className="text-xs text-center">Select a section to edit its properties</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
          <ErrorPanel errors={errors} />
        </div>

        {/* Right panel: Preview + Token Editor */}
        <div className="flex overflow-hidden">
          <div className="flex-1 overflow-hidden">
            <Preview
              sections={validatedSections}
              themeTokens={mergedTokens}
              viewport={viewport}
              selectedSectionId={selectedSectionId}
              onSectionClick={setSelectedSectionId}
              onContentRef={(el) => { previewRef.current = el; }}
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
      {builderOpen && (
        <ComponentBuilder
          themeTokens={mergedTokens}
          editingDefinition={editingComposite}
          onSave={handleSaveComposite}
          onClose={() => { setBuilderOpen(false); setEditingComposite(null); }}
        />
      )}
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
