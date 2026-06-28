import type { ProductCardProps } from "@/lib/schemas/product-card";

export function ProductCard({ title, description, badge, imageUrl, action }: ProductCardProps) {
  return (
    <div
      style={{
        backgroundColor: "var(--sandy-color-background)",
        color: "var(--sandy-color-foreground)",
        borderRadius: "var(--sandy-radius-lg)",
        border: "var(--sandy-border-thin) solid var(--sandy-color-border)",
        boxShadow: "var(--sandy-shadow-sm)",
        fontFamily: "var(--sandy-font-family)",
        overflow: "hidden",
      }}
    >
      {imageUrl ? (
        <div
          style={{
            width: "100%",
            height: 160,
            backgroundImage: `url(${imageUrl})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: 160,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "var(--sandy-font-size-sm)",
            backgroundColor: "var(--sandy-color-secondary)",
            color: "var(--sandy-color-muted)",
          }}
        >
          No image
        </div>
      )}
      <div style={{ padding: "var(--sandy-spacing-md)" }}>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "var(--sandy-spacing-sm)",
            marginBottom: "var(--sandy-spacing-sm)",
          }}
        >
          <h3
            style={
              {
                margin: 0,
                fontSize: "var(--sandy-font-size-lg)",
                fontWeight: "var(--sandy-font-heading-weight)",
              } as React.CSSProperties
            }
          >
            {title}
          </h3>
          {badge && (
            <span
              style={{
                fontSize: "var(--sandy-font-size-xs)",
                padding: "2px 8px",
                flexShrink: 0,
                backgroundColor: "var(--sandy-color-primary)",
                color: "#fff",
                borderRadius: "var(--sandy-radius-sm)",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <p
          style={{
            margin: 0,
            marginBottom: "var(--sandy-spacing-sm)",
            fontSize: "var(--sandy-font-size-sm)",
            color: "var(--sandy-color-muted)",
          }}
        >
          {description}
        </p>
        {action && (
          <a
            href={action.href}
            style={
              {
                fontSize: "var(--sandy-font-size-sm)",
                fontWeight: "var(--sandy-font-heading-weight)",
                color: "var(--sandy-color-primary)",
                textDecoration: "none",
              } as React.CSSProperties
            }
          >
            {action.label} &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
