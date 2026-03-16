import type { BalanceCardProps } from "@/lib/schemas/balance-card";
import { renderIcon } from "@/lib/icons";

export function BalanceCard({
  label,
  amount,
  visible = true,
  footnote,
  action,
}: BalanceCardProps) {
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
          className="text-sm m-0"
          style={{ color: "var(--sandy-color-muted)" }}
        >
          {label}
        </p>
        <p
          className="m-0 mt-1"
          style={
            {
              fontSize: 28,
              fontWeight: "var(--sandy-font-heading-weight)",
              letterSpacing: "-0.02em",
            } as React.CSSProperties
          }
        >
          {visible ? amount : "R$ ••••"}
        </p>
        {footnote && (
          <p
            className="text-xs m-0 mt-1"
            style={{ color: "var(--sandy-color-muted)" }}
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
          style={{
            width: 40,
            height: 40,
            borderRadius: "50%",
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
