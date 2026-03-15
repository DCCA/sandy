import type { BalanceCardProps } from "@/lib/schemas/balance-card";

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
        backgroundColor: "var(--sandy-color-secondary)",
        borderRadius: "var(--sandy-radius-lg)",
        padding: "var(--sandy-spacing-lg)",
      }}
    >
      <p className="text-xs m-0" style={{ color: "var(--sandy-color-muted)" }}>
        {label}
      </p>

      <p
        className="text-2xl m-0 mt-1"
        style={
          {
            fontWeight: "var(--sandy-font-heading-weight)",
          } as React.CSSProperties
        }
      >
        {visible ? amount : "••••••"}
      </p>

      {footnote && (
        <p
          className="text-xs m-0 mt-2"
          style={{ color: "var(--sandy-color-muted)" }}
        >
          {footnote}
        </p>
      )}

      {action && (
        <a
          href={action.href}
          className="text-sm mt-3 inline-flex items-center gap-1"
          style={{
            color: "var(--sandy-color-primary)",
            textDecoration: "none",
            fontWeight: "var(--sandy-font-heading-weight)",
          } as React.CSSProperties}
        >
          {action.label} →
        </a>
      )}
    </div>
  );
}
