import type { BalanceCardProps } from "@/lib/schemas/balance-card";
import { renderIcon } from "@/lib/icons";

export function BalanceCard({ label, amount, visible = true, footnote, action }: BalanceCardProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        display: "flex",
        alignItems: "center",
        gap: "var(--sandy-spacing-md)",
      }}
    >
      {/* Left: label + amount */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--sandy-font-size-sm)",
            color: "var(--sandy-color-muted)",
          }}
        >
          {label}
        </p>
        <p
          aria-label={visible ? amount : "Balance hidden"}
          style={
            {
              margin: 0,
              marginTop: "var(--sandy-spacing-xs)",
              fontSize: "var(--sandy-font-size-2xl)",
              fontWeight: "var(--sandy-font-heading-weight)",
              letterSpacing: "var(--sandy-letter-spacing-tight)",
              lineHeight: "var(--sandy-line-height-tight)",
              overflowWrap: "anywhere",
            } as React.CSSProperties
          }
        >
          {visible ? amount : "R$ ••••"}
        </p>
        {footnote && (
          <p
            style={{
              margin: 0,
              marginTop: "var(--sandy-spacing-xs)",
              fontSize: "var(--sandy-font-size-xs)",
              color: "var(--sandy-color-muted)",
            }}
          >
            {footnote}
          </p>
        )}
      </div>

      {/* Right: chevron button */}
      {action && (
        <a
          href={action.href}
          title={action.label}
          aria-label={action.label}
          style={{
            width: 40,
            height: 40,
            borderRadius: "var(--sandy-radius-full)",
            backgroundColor: "var(--sandy-color-secondary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--sandy-color-muted)",
            textDecoration: "none",
            flexShrink: 0,
            boxShadow: "var(--sandy-shadow-sm)",
          }}
        >
          {renderIcon("chevron-right", { size: 20, color: "var(--sandy-color-muted)" })}
        </a>
      )}
    </div>
  );
}
