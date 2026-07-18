"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { Copy, Download, Pencil, Plus, Puzzle, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompositeRenderer } from "@/components/composite/composite-renderer";
import { applyTheme } from "@/lib/theme/css-vars";
import type { CompositeDefinition } from "@/lib/composite/types";
import type { ThemeTokens } from "@/lib/theme/types";

type ComponentLibraryProps = {
  composites: CompositeDefinition[];
  themeTokens: ThemeTokens;
  onEdit: (def: CompositeDefinition) => void;
  onDuplicate: (def: CompositeDefinition) => void;
  onDelete: (id: string) => void;
  onExportOne: (def: CompositeDefinition) => void;
  onExportAll: () => void;
  onCreate: () => void;
  onClose: () => void;
};

const UNCATEGORIZED = "Uncategorized";

// Intl does the pluralisation and the "ago" phrasing, so there is no date library here
// and no hand-rolled plural table.
const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const DIVISIONS: [limit: number, unit: Intl.RelativeTimeFormatUnit][] = [
  [60, "second"],
  [60, "minute"],
  [24, "hour"],
  [7, "day"],
  [4.34524, "week"],
  [12, "month"],
  [Number.POSITIVE_INFINITY, "year"],
];

/** "-" when the component predates timestamps, "just now" under a minute, else "2 hours ago". */
export function relativeTime(timestamp: number | undefined, now: number = Date.now()): string {
  if (typeof timestamp !== "number" || !Number.isFinite(timestamp)) return "-";
  const seconds = (timestamp - now) / 1000;
  if (Math.abs(seconds) < 45) return "just now";
  let value = seconds;
  for (const [limit, unit] of DIVISIONS) {
    if (Math.abs(value) < limit) return rtf.format(Math.round(value), unit);
    value /= limit;
  }
  return "-";
}

function categoryOf(def: CompositeDefinition): string {
  return def.category?.trim() || UNCATEGORIZED;
}

function PreviewErrorFallback({ error }: { error: unknown }) {
  // react-error-boundary v6 types the error as unknown, so narrow before reading .message.
  const message = error instanceof Error ? error.message : String(error);
  return (
    <div className="flex h-full flex-col items-center justify-center gap-1 p-4 text-center">
      <span className="text-sm leading-none text-red-400">!</span>
      <p className="font-mono text-[10px] text-muted-foreground">{message}</p>
    </div>
  );
}

function LibraryCard({
  def,
  themeTokens,
  onEdit,
  onDuplicate,
  onDelete,
  onExportOne,
}: {
  def: CompositeDefinition;
  themeTokens: ThemeTokens;
  onEdit: (def: CompositeDefinition) => void;
  onDuplicate: (def: CompositeDefinition) => void;
  onDelete: (id: string) => void;
  onExportOne: (def: CompositeDefinition) => void;
}) {
  // One ref per card: the --sandy-* vars are scoped to this card's preview element,
  // never to document.documentElement.
  const previewRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (previewRef.current) {
      applyTheme(themeTokens, previewRef.current);
    }
  }, [themeTokens]);

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border/50 bg-card/40">
      {/* Live preview, isolated so one broken definition cannot take down the library */}
      <div
        ref={previewRef}
        className="h-40 overflow-hidden"
        style={{
          backgroundColor: "var(--sandy-color-background, #fff)",
          color: "var(--sandy-color-foreground, #111)",
          padding: "var(--sandy-spacing-md, 16px)",
        }}
      >
        <ErrorBoundary FallbackComponent={PreviewErrorFallback} resetKeys={[def.id]}>
          <CompositeRenderer definition={def} props={{}} />
        </ErrorBoundary>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 border-t border-border/50 p-3">
        <div className="flex items-start gap-2">
          <h3 className="min-w-0 flex-1 truncate text-xs font-semibold">{def.name}</h3>
          <span className="shrink-0 rounded-full bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground">
            {categoryOf(def)}
          </span>
        </div>

        {def.description && (
          <p className="line-clamp-2 text-[11px] text-muted-foreground">{def.description}</p>
        )}

        <p className="text-[10px] text-muted-foreground/70">{`Updated ${relativeTime(def.updatedAt)}`}</p>

        <div className="mt-auto flex items-center gap-0.5 pt-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onEdit(def)}
            title={`Edit ${def.name}`}
          >
            <Pencil className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onDuplicate(def)}
            title={`Duplicate ${def.name}`}
          >
            <Copy className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => onExportOne(def)}
            title={`Export ${def.name}`}
          >
            <Download className="size-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 text-red-400 hover:text-red-300"
            onClick={() => onDelete(def.id)}
            title={`Delete ${def.name}`}
          >
            <Trash2 className="size-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ComponentLibrary({
  composites,
  themeTokens,
  onEdit,
  onDuplicate,
  onDelete,
  onExportOne,
  onExportAll,
  onCreate,
  onClose,
}: ComponentLibraryProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");

  const categories = useMemo(() => {
    const seen = new Set(composites.map(categoryOf));
    return ["All", ...[...seen].sort((a, b) => a.localeCompare(b))];
  }, [composites]);

  const visible = useMemo(() => {
    const query = search.trim().toLowerCase();
    return composites
      .filter((def) => category === "All" || categoryOf(def) === category)
      .filter((def) => {
        if (!query) return true;
        return [def.name, def.description ?? "", categoryOf(def)].some((field) =>
          field.toLowerCase().includes(query),
        );
      })
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, [composites, search, category]);

  const isEmptyLibrary = composites.length === 0;

  return (
    // A named region rather than a bare div: the library overlays the sandbox without
    // unmounting it, so assistive tech (and tests) need a way to scope to this surface
    // instead of matching the page still rendered underneath.
    <section
      aria-label="Component library"
      className="fixed inset-0 z-50 flex flex-col bg-background/95 backdrop-blur-md"
    >
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b border-border/50 px-4 py-2.5">
        <h2 className="text-sm font-semibold">Component Library</h2>
        <span className="text-xs text-muted-foreground">
          {composites.length} {composites.length === 1 ? "component" : "components"}
        </span>
        <div className="flex-1" />
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 px-2 text-xs"
          onClick={onExportAll}
          disabled={isEmptyLibrary}
          title="Export all components"
        >
          <Download className="size-3.5" />
          Export all
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="h-7 gap-1.5 px-3 text-xs"
          onClick={onCreate}
          title="New component"
        >
          <Plus className="size-3.5" />
          New component
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={onClose}
          title="Close component library"
        >
          <X className="size-4" />
        </Button>
      </div>

      {/* Search + category filters */}
      {!isEmptyLibrary && (
        <div className="flex shrink-0 flex-wrap items-center gap-3 border-b border-border/50 px-4 py-2">
          <div className="flex items-center gap-2">
            <label htmlFor="component-library-search" className="text-xs text-muted-foreground">
              Search
            </label>
            <input
              id="component-library-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Name, description or category"
              className="h-7 w-56 rounded border border-border/50 bg-muted/30 px-2 text-xs text-foreground outline-none focus:border-accent/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                aria-pressed={category === cat}
                onClick={() => setCategory(cat)}
                className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${
                  category === cat
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/60"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {isEmptyLibrary ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Puzzle className="size-10 opacity-20" />
            <div className="text-center">
              <p className="text-sm font-medium">No components yet</p>
              <p className="mt-1 text-xs opacity-60">
                Build a component out of primitives and it shows up here.
              </p>
            </div>
            <Button variant="secondary" size="sm" className="h-7 px-3 text-xs" onClick={onCreate}>
              Create your first component
            </Button>
          </div>
        ) : visible.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-muted-foreground">
            <Puzzle className="size-10 opacity-20" />
            <div className="text-center">
              <p className="text-sm font-medium">No components match this search</p>
              <p className="mt-1 text-xs opacity-60">Try a different term or clear the search.</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="h-7 px-3 text-xs"
              onClick={() => {
                setSearch("");
                setCategory("All");
              }}
            >
              Clear search
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map((def) => (
              <LibraryCard
                key={def.id}
                def={def}
                themeTokens={themeTokens}
                onEdit={onEdit}
                onDuplicate={onDuplicate}
                onDelete={onDelete}
                onExportOne={onExportOne}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
