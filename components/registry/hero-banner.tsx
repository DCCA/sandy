import type { HeroBannerProps } from "@/lib/schemas/hero-banner";

export function HeroBanner({ title, subtitle, cta, align = "left" }: HeroBannerProps) {
  return (
    <div
      className="w-full px-[var(--sandy-spacing-lg)] py-[var(--sandy-spacing-lg)]"
      style={{
        backgroundColor: "var(--sandy-color-primary)",
        color: "#fff",
        borderRadius: "var(--sandy-radius-lg)",
        fontFamily: "var(--sandy-font-family)",
        textAlign: align,
      }}
    >
      <h1
        className="text-3xl mb-2"
        style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
      >
        {title}
      </h1>
      {subtitle && (
        <p className="text-lg opacity-90 mb-4" style={{ fontWeight: "var(--sandy-font-body-weight)" } as React.CSSProperties}>
          {subtitle}
        </p>
      )}
      {cta && (
        <a
          href={cta.href}
          className="inline-block px-5 py-2 text-sm font-medium"
          style={{
            backgroundColor: "#fff",
            color: "var(--sandy-color-primary)",
            borderRadius: "var(--sandy-radius-md)",
          }}
        >
          {cta.label}
        </a>
      )}
    </div>
  );
}
