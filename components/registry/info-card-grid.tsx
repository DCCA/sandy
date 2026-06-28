import type { InfoCardGridProps } from "@/lib/schemas/info-card-grid";
import { renderIcon } from "@/lib/icons";

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
            borderRadius: "var(--sandy-radius-lg)",
            padding: "var(--sandy-spacing-md)",
            display: "flex",
            flexDirection: "column",
            minHeight: 140,
            boxShadow: "var(--sandy-shadow-sm)",
            position: "relative",
          }}
        >
          <h3
            style={
              {
                margin: 0,
                fontSize: "var(--sandy-font-size-sm)",
                fontWeight: "var(--sandy-font-heading-weight)",
              } as React.CSSProperties
            }
          >
            {card.title}
          </h3>

          {card.description && (
            <p
              style={{
                margin: 0,
                marginTop: "var(--sandy-spacing-sm)",
                fontSize: "var(--sandy-font-size-xs)",
                color: "var(--sandy-color-muted)",
              }}
            >
              {card.description}
            </p>
          )}

          {card.value && (
            <p
              style={
                {
                  margin: 0,
                  marginTop: "var(--sandy-spacing-sm)",
                  fontSize: "var(--sandy-font-size-lg)",
                  fontWeight: "var(--sandy-font-heading-weight)",
                } as React.CSSProperties
              }
            >
              {card.value}
            </p>
          )}

          {/* Bottom row: footnote/action + arrow */}
          <div
            style={{
              marginTop: "auto",
              paddingTop: "var(--sandy-spacing-sm)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
            }}
          >
            <div>
              {card.footnote && (
                <p
                  style={{
                    margin: 0,
                    fontSize: "var(--sandy-font-size-xs)",
                    color: "var(--sandy-color-muted)",
                  }}
                >
                  {card.footnote}
                </p>
              )}
              {card.action && (
                <a
                  href={card.action.href}
                  style={
                    {
                      fontSize: "var(--sandy-font-size-xs)",
                      color: "var(--sandy-color-primary)",
                      textDecoration: "none",
                      fontWeight: "var(--sandy-font-heading-weight)",
                      display: "inline-block",
                      marginTop: 2,
                    } as React.CSSProperties
                  }
                >
                  {card.action.label}
                </a>
              )}
            </div>
            {card.action && (
              <span style={{ color: "var(--sandy-color-primary)", flexShrink: 0 }}>
                {renderIcon("arrow-right", { size: 18, color: "var(--sandy-color-primary)" })}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
