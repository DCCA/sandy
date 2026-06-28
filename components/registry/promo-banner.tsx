import type { PromoBannerProps } from "@/lib/schemas/promo-banner";

const variantToken: Record<string, string> = {
  info: "var(--sandy-color-info)",
  warning: "var(--sandy-color-warning)",
  success: "var(--sandy-color-success)",
};

export function PromoBanner({ title, description, href, variant = "info" }: PromoBannerProps) {
  const token = variantToken[variant] ?? variantToken.info;

  return (
    <a
      href={href}
      aria-label={title}
      style={{
        display: "block",
        width: "100%",
        textDecoration: "none",
        backgroundColor: `color-mix(in srgb, ${token} 12%, var(--sandy-color-background))`,
        borderLeft: `4px solid ${token}`,
        borderRadius: "var(--sandy-radius-md)",
        padding: "var(--sandy-spacing-md)",
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        overflowWrap: "break-word",
      }}
    >
      <h3
        style={
          {
            margin: 0,
            marginBottom: 4,
            fontSize: "var(--sandy-font-size-md)",
            fontWeight: "var(--sandy-font-heading-weight)",
          } as React.CSSProperties
        }
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: 0,
            fontSize: "var(--sandy-font-size-sm)",
            color: "var(--sandy-color-muted)",
          }}
        >
          {description}
        </p>
      )}
    </a>
  );
}
