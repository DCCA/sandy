import Link from "next/link";
import { getRegistryKeys, getRegistryItem, defaultPage } from "@/lib/registry";
import { themePresets } from "@/lib/theme/presets";
import { serializeState } from "@/lib/sandbox/serialize";
import { SandyLogo } from "@/components/sandy-logo";

const EXAMPLE_PAGE = `{
  "version": "2.0",
  "theme": { "brand": "default", "mode": "light" },
  "sections": [
    {
      "id": "sec_1",
      "component": "HeroBanner",
      "props": {
        "title": "Welcome back",
        "subtitle": "Your options in one place",
        "cta": { "label": "See offers", "href": "/offers" }
      }
    }
  ]
}`;

const COLOR_KEYS = [
  "primary",
  "accent",
  "background",
  "foreground",
  "secondary",
  "border",
  "muted",
] as const;

export default function Home() {
  const componentKeys = getRegistryKeys();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border backdrop-blur-md bg-background/80 sticky top-0 z-10">
        <SandyLogo />
        <Link
          href="/sandbox"
          className="inline-flex items-center h-7 px-3 text-xs font-medium rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
        >
          Open Sandbox
        </Link>
      </nav>

      {/* Hero */}
      <section className="dot-grid border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight mb-4 leading-tight">
            Schema-first
            <br />
            <span className="text-accent">component sandbox</span>
          </h1>
          <p className="text-muted-foreground text-base max-w-xl mx-auto mb-10 leading-relaxed">
            Compose multi-section pages from validated JSON with multi-brand theming.
            Registry-only rendering, strict contracts, token-driven design.
          </p>
          <div className="max-w-md mx-auto mb-10 text-left">
            <pre className="bg-background ring-1 ring-foreground/10 rounded-lg px-5 py-4 font-mono text-xs text-muted-foreground leading-relaxed overflow-x-auto">
              {EXAMPLE_PAGE}
            </pre>
          </div>
          <Link
            href="/sandbox"
            className="inline-flex items-center h-10 px-6 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Open Sandbox
          </Link>
        </div>
      </section>

      {/* Theme Showcase */}
      <section className="max-w-5xl mx-auto px-6 py-20">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Theme Presets</h2>
        <p className="text-muted-foreground text-sm mb-8">
          Token-based theming with colors, typography, radius, and spacing.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themePresets.map((preset) => (
            <div
              key={preset.id}
              className="rounded-lg ring-1 ring-foreground/10 bg-card p-5"
            >
              <h3 className="font-semibold text-sm mb-3">{preset.name}</h3>
              <div className="flex gap-1.5 mb-4">
                {COLOR_KEYS.map((key) => (
                  <span
                    key={key}
                    className="size-6 rounded-full ring-1 ring-white/10"
                    style={{ backgroundColor: preset.tokens.color[key] }}
                    title={key}
                  />
                ))}
              </div>
              <div className="space-y-1 text-xs text-muted-foreground font-mono">
                <div>font: {preset.tokens.typography.fontFamily.split(",")[0].replace(/'/g, "")}</div>
                <div>radius: {preset.tokens.radius.sm}/{preset.tokens.radius.md}/{preset.tokens.radius.lg}px</div>
                <div>weights: {preset.tokens.typography.headingWeight}/{preset.tokens.typography.bodyWeight}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Component Gallery */}
      <section className="max-w-5xl mx-auto px-6 py-20 border-t border-border">
        <h2 className="text-2xl font-semibold tracking-tight mb-2">Component Registry</h2>
        <p className="text-muted-foreground text-sm mb-8">
          {componentKeys.length} validated components, each with a strict JSON contract.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {componentKeys.map((key) => {
            const item = getRegistryItem(key);
            if (!item) return null;
            const page = defaultPage(item.example);
            const encoded = serializeState(page);
            const propsPreview = JSON.stringify(item.example.props, null, 2)
              .split("\n")
              .slice(0, 5)
              .join("\n");

            return (
              <Link
                key={key}
                href={`/sandbox?s=${encoded}`}
                className="group rounded-lg ring-1 ring-foreground/10 bg-card p-4 hover:ring-accent/40 transition-colors"
              >
                <h3 className="font-semibold text-sm mb-1">{item.metadata.name}</h3>
                <p className="text-[11px] text-muted-foreground mb-3 leading-relaxed line-clamp-2">
                  {item.metadata.description}
                </p>
                <pre className="bg-muted/30 rounded px-2.5 py-2 font-mono text-[10px] text-muted-foreground leading-relaxed overflow-hidden max-h-[72px]">
                  {propsPreview}
                </pre>
                <span className="block mt-3 text-[11px] text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Try in sandbox &rarr;
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Footer CTA */}
      <section className="border-t border-border py-16 text-center">
        <p className="text-muted-foreground text-sm mb-4">Ready to start building?</p>
        <Link
          href="/sandbox"
          className="inline-flex items-center h-10 px-6 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
        >
          Open Sandbox
        </Link>
      </section>
    </div>
  );
}
