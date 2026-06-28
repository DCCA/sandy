import type { HeroBannerProps } from "@/lib/schemas/hero-banner";

export function HeroBanner({ title, subtitle, cta, align = "left" }: HeroBannerProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--sandy-color-primary)",
        color: "#fff",
        borderRadius: "var(--sandy-radius-lg)",
        fontFamily: "var(--sandy-font-family)",
        textAlign: align,
        padding: "var(--sandy-spacing-lg)",
      }}
    >
      <h1
        style={
          {
            margin: 0,
            marginBottom: "var(--sandy-spacing-sm)",
            fontSize: "var(--sandy-font-size-2xl)",
            fontWeight: "var(--sandy-font-heading-weight)",
            lineHeight: "var(--sandy-line-height-tight)",
          } as React.CSSProperties
        }
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={
            {
              margin: 0,
              marginBottom: "var(--sandy-spacing-md)",
              fontSize: "var(--sandy-font-size-lg)",
              fontWeight: "var(--sandy-font-body-weight)",
              opacity: 0.9,
            } as React.CSSProperties
          }
        >
          {subtitle}
        </p>
      )}
      {cta && (
        <a
          href={cta.href}
          style={
            {
              display: "inline-block",
              padding: "var(--sandy-spacing-sm) var(--sandy-spacing-lg)",
              fontSize: "var(--sandy-font-size-sm)",
              fontWeight: "var(--sandy-font-heading-weight)",
              backgroundColor: "#fff",
              color: "var(--sandy-color-primary)",
              borderRadius: "var(--sandy-radius-md)",
              textDecoration: "none",
            } as React.CSSProperties
          }
        >
          {cta.label}
        </a>
      )}
    </div>
  );
}
