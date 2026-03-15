import type { ProductCardProps } from "@/lib/schemas/product-card";

export function ProductCard({ title, description, badge, imageUrl, action }: ProductCardProps) {
  return (
    <div
      className="overflow-hidden"
      style={{
        backgroundColor: "var(--sandy-color-background)",
        color: "var(--sandy-color-foreground)",
        borderRadius: "var(--sandy-radius-lg)",
        border: "1px solid var(--sandy-color-border)",
        boxShadow: "var(--sandy-shadow-sm)",
        fontFamily: "var(--sandy-font-family)",
      }}
    >
      {imageUrl ? (
        <div
          className="w-full h-40 bg-cover bg-center"
          style={{ backgroundImage: `url(${imageUrl})` }}
        />
      ) : (
        <div
          className="w-full h-40 flex items-center justify-center text-sm"
          style={{
            backgroundColor: "var(--sandy-color-secondary)",
            color: "var(--sandy-color-muted)",
          }}
        >
          No image
        </div>
      )}
      <div style={{ padding: "var(--sandy-spacing-md)" }}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3
            className="text-lg"
            style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
          >
            {title}
          </h3>
          {badge && (
            <span
              className="text-xs px-2 py-0.5 shrink-0"
              style={{
                backgroundColor: "var(--sandy-color-primary)",
                color: "#fff",
                borderRadius: "var(--sandy-radius-sm)",
              }}
            >
              {badge}
            </span>
          )}
        </div>
        <p className="text-sm mb-3" style={{ color: "var(--sandy-color-muted)" }}>
          {description}
        </p>
        {action && (
          <a
            href={action.href}
            className="inline-block text-sm font-medium"
            style={{ color: "var(--sandy-color-primary)" }}
          >
            {action.label} &rarr;
          </a>
        )}
      </div>
    </div>
  );
}
