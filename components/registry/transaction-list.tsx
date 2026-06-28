import type { TransactionListProps } from "@/lib/schemas/transaction-list";
import { renderIcon } from "@/lib/icons";

const typeConfig: Record<string, { icon: string; bgColor: string; fgColor: string }> = {
  sent: {
    icon: "arrow-up-right",
    bgColor: "var(--sandy-color-info)",
    fgColor: "var(--sandy-color-info)",
  },
  received: {
    icon: "arrow-down-left",
    bgColor: "var(--sandy-color-success)",
    fgColor: "var(--sandy-color-success)",
  },
  payment: {
    icon: "arrow-right",
    bgColor: "var(--sandy-color-info)",
    fgColor: "var(--sandy-color-info)",
  },
  investment: {
    icon: "trending-up",
    bgColor: "var(--sandy-color-success)",
    fgColor: "var(--sandy-color-success)",
  },
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
          style={
            {
              margin: 0,
              marginBottom: "var(--sandy-spacing-md)",
              fontSize: "var(--sandy-font-size-md)",
              fontWeight: "var(--sandy-font-heading-weight)",
              color: "var(--sandy-color-primary)",
              fontStyle: "italic",
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

          const rowLabel = [tx.title, tx.subtitle, tx.amount, tx.timestamp]
            .filter(Boolean)
            .join(", ");

          return (
            <div
              key={i}
              role="group"
              aria-label={rowLabel}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--sandy-spacing-sm)",
              }}
            >
              {/* Icon circle */}
              <div
                aria-hidden="true"
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "var(--sandy-radius-full)",
                  backgroundColor: "var(--sandy-color-surface)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  color: config.fgColor,
                }}
              >
                {renderIcon(config.icon, { size: 22, color: config.fgColor })}
              </div>

              {/* Title + Subtitle */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p
                  style={
                    {
                      margin: 0,
                      fontSize: "var(--sandy-font-size-sm)",
                      fontWeight: "var(--sandy-font-heading-weight)",
                      overflowWrap: "anywhere",
                    } as React.CSSProperties
                  }
                >
                  {tx.title}
                </p>
                {tx.subtitle && (
                  <p
                    style={{
                      margin: 0,
                      marginTop: 2,
                      fontSize: "var(--sandy-font-size-xs)",
                      color: "var(--sandy-color-muted)",
                    }}
                  >
                    {tx.subtitle}
                  </p>
                )}
              </div>

              {/* Amount + Timestamp */}
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                <p
                  style={
                    {
                      margin: 0,
                      fontSize: "var(--sandy-font-size-sm)",
                      fontWeight: "var(--sandy-font-heading-weight)",
                      color: isReceived
                        ? "var(--sandy-color-success)"
                        : "var(--sandy-color-foreground)",
                    } as React.CSSProperties
                  }
                >
                  {tx.amount}
                </p>
                {tx.timestamp && (
                  <p
                    style={{
                      margin: 0,
                      marginTop: 2,
                      fontSize: "var(--sandy-font-size-xs)",
                      color: "var(--sandy-color-muted)",
                    }}
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
          style={
            {
              display: "block",
              textAlign: "center",
              marginTop: "var(--sandy-spacing-lg)",
              padding: "var(--sandy-spacing-sm) var(--sandy-spacing-md)",
              backgroundColor: "var(--sandy-color-surface)",
              borderRadius: "var(--sandy-radius-lg)",
              color: "var(--sandy-color-primary)",
              textDecoration: "none",
              fontWeight: "var(--sandy-font-heading-weight)",
              fontSize: "var(--sandy-font-size-sm)",
            } as React.CSSProperties
          }
        >
          {showAllLabel}
        </a>
      )}
    </div>
  );
}
