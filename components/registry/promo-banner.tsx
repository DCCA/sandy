import type { PromoBannerProps } from "@/lib/schemas/promo-banner";

const variantStyles: Record<string, { bg: string; border: string }> = {
  info: { bg: "#eff6ff", border: "#3b82f6" },
  warning: { bg: "#fffbeb", border: "#f59e0b" },
  success: { bg: "#f0fdf4", border: "#22c55e" },
};

export function PromoBanner({ title, description, href, variant = "info" }: PromoBannerProps) {
  const styles = variantStyles[variant] ?? variantStyles.info;

  return (
    <a
      href={href}
      style={{
        display: "block",
        width: "100%",
        textDecoration: "none",
        backgroundColor: styles.bg,
        borderLeft: `4px solid ${styles.border}`,
        borderRadius: "var(--sandy-radius-md)",
        padding: "var(--sandy-spacing-md)",
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
      }}
    >
      <h3
        style={{
          margin: 0,
          marginBottom: 4,
          fontSize: "var(--sandy-font-size-md)",
          fontWeight: "var(--sandy-font-heading-weight)",
        } as React.CSSProperties}
      >
        {title}
      </h3>
      {description && (
        <p style={{ margin: 0, fontSize: "var(--sandy-font-size-sm)", color: "var(--sandy-color-muted)" }}>
          {description}
        </p>
      )}
    </a>
  );
}
