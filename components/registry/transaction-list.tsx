import type { TransactionListProps } from "@/lib/schemas/transaction-list";
import { renderIcon } from "@/lib/icons";

const typeConfig: Record<string, { icon: string; bg: string }> = {
  sent: { icon: "arrow-up-right", bg: "rgba(0,102,204,0.08)" },
  received: { icon: "arrow-down-left", bg: "rgba(0,168,107,0.10)" },
  payment: { icon: "arrow-right", bg: "rgba(0,102,204,0.08)" },
  investment: { icon: "trending-up", bg: "rgba(0,168,107,0.10)" },
};

export function TransactionList({
  heading,
  transactions,
  showAllLabel,
  showAllHref,
}: TransactionListProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        backgroundColor: "var(--sandy-color-secondary)",
        borderRadius: "var(--sandy-radius-lg)",
        padding: "var(--sandy-spacing-lg)",
        boxShadow: "var(--sandy-shadow-sm)",
      }}
    >
      {heading && (
        <h2
          className="text-base m-0"
          style={
            {
              fontWeight: "var(--sandy-font-heading-weight)",
              color: "var(--sandy-color-primary)",
              fontStyle: "italic",
              marginBottom: "var(--sandy-spacing-md)",
            } as React.CSSProperties
          }
        >
          {heading}
        </h2>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--sandy-spacing-md)" }}>
        {transactions.map((tx, i) => {
          const config = typeConfig[tx.type ?? "payment"] ?? typeConfig.payment;
          const isReceived = tx.type === "received";

          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sandy-spacing-sm)",
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: config.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: isReceived ? "var(--sandy-color-accent)" : "var(--sandy-color-primary)",
                }}
              >
                {renderIcon(config.icon, {
                  size: 22,
                  color: isReceived ? "var(--sandy-color-accent)" : "var(--sandy-color-primary)",
                })}
              </div>

              {/* Title + Subtitle */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  className="text-sm m-0"
                  style={
                    {
                      fontWeight: "var(--sandy-font-heading-weight)",
                    } as React.CSSProperties
                  }
                >
                  {tx.title}
                </p>
                {tx.subtitle && (
                  <p
                    className="text-xs m-0 mt-0.5"
                    style={{ color: "var(--sandy-color-muted)" }}
                  >
                    {tx.subtitle}
                  </p>
                )}
              </div>

              {/* Amount + Timestamp */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p
                  className="text-sm m-0"
                  style={
                    {
                      fontWeight: "var(--sandy-font-heading-weight)",
                      color: isReceived
                        ? "var(--sandy-color-accent)"
                        : "var(--sandy-color-foreground)",
                    } as React.CSSProperties
                  }
                >
                  {tx.amount}
                </p>
                {tx.timestamp && (
                  <p
                    className="text-xs m-0 mt-0.5"
                    style={{ color: "var(--sandy-color-muted)" }}
                  >
                    {tx.timestamp}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showAllLabel && showAllHref && (
        <a
          href={showAllHref}
          style={{
            display: "block",
            textAlign: "center",
            marginTop: "var(--sandy-spacing-lg)",
            padding: "var(--sandy-spacing-sm) var(--sandy-spacing-md)",
            backgroundColor: "var(--sandy-color-background)",
            borderRadius: "var(--sandy-radius-lg)",
            color: "var(--sandy-color-primary)",
            textDecoration: "none",
            fontWeight: "var(--sandy-font-heading-weight)",
            fontSize: 14,
          } as React.CSSProperties}
        >
          {showAllLabel}
        </a>
      )}
    </div>
  );
}
