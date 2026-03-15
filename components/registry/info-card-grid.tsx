import type { InfoCardGridProps } from "@/lib/schemas/info-card-grid";

export function InfoCardGrid({ cards }: InfoCardGridProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        display: "grid",
        gridTemplateColumns: "repeat(2, 1fr)",
        gap: "var(--sandy-spacing-sm)",
      }}
    >
      {cards.map((card, i) => (
        <div
          key={i}
          style={{
            backgroundColor: "var(--sandy-color-secondary)",
            borderRadius: "var(--sandy-radius-md)",
            padding: "var(--sandy-spacing-md)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--sandy-spacing-xs)",
          }}
        >
          <h3
            className="text-sm m-0"
            style={
              {
                fontWeight: "var(--sandy-font-heading-weight)",
              } as React.CSSProperties
            }
          >
            {card.title}
          </h3>

          {card.description && (
            <p
              className="text-xs m-0"
              style={{ color: "var(--sandy-color-muted)" }}
            >
              {card.description}
            </p>
          )}

          {card.value && (
            <p
              className="text-base m-0"
              style={
                {
                  color: "var(--sandy-color-primary)",
                  fontWeight: "var(--sandy-font-heading-weight)",
                } as React.CSSProperties
              }
            >
              {card.value}
            </p>
          )}

          {card.footnote && (
            <p
              className="text-xs m-0"
              style={{ color: "var(--sandy-color-muted)" }}
            >
              {card.footnote}
            </p>
          )}

          {card.action && (
            <a
              href={card.action.href}
              className="text-xs mt-auto inline-flex items-center gap-1"
              style={{
                color: "var(--sandy-color-primary)",
                textDecoration: "none",
                fontWeight: "var(--sandy-font-heading-weight)",
              } as React.CSSProperties}
            >
              {card.action.label} →
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
