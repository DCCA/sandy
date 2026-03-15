import type { TransactionListProps } from "@/lib/schemas/transaction-list";

const typeIcons: Record<string, string> = {
  sent: "↗",
  received: "↙",
  payment: "→",
  investment: "↗",
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
      }}
    >
      {heading && (
        <h2
          className="text-base mb-3 m-0"
          style={
            {
              fontWeight: "var(--sandy-font-heading-weight)",
            } as React.CSSProperties
          }
        >
          {heading}
        </h2>
      )}

      <div>
        {transactions.map((tx, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--sandy-spacing-sm)",
              padding: "var(--sandy-spacing-sm) 0",
              borderBottom:
                i < transactions.length - 1
                  ? "1px solid var(--sandy-color-border)"
                  : "none",
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "var(--sandy-color-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                flexShrink: 0,
                color: "var(--sandy-color-primary)",
                fontWeight: 700,
              }}
            >
              {typeIcons[tx.type ?? "payment"]}
            </div>

            {/* Title + Subtitle */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                className="text-sm m-0"
                style={
                  {
                    fontWeight: "var(--sandy-font-heading-weight)",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  } as React.CSSProperties
                }
              >
                {tx.title}
              </p>
              {tx.subtitle && (
                <p
                  className="text-xs m-0"
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
                    color:
                      tx.type === "received"
                        ? "var(--sandy-color-primary)"
                        : "var(--sandy-color-foreground)",
                  } as React.CSSProperties
                }
              >
                {tx.amount}
              </p>
              {tx.timestamp && (
                <p
                  className="text-xs m-0"
                  style={{ color: "var(--sandy-color-muted)" }}
                >
                  {tx.timestamp}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {showAllLabel && showAllHref && (
        <div style={{ textAlign: "center", marginTop: "var(--sandy-spacing-md)" }}>
          <a
            href={showAllHref}
            className="text-sm"
            style={{
              color: "var(--sandy-color-primary)",
              textDecoration: "none",
              fontWeight: "var(--sandy-font-heading-weight)",
            } as React.CSSProperties}
          >
            {showAllLabel}
          </a>
        </div>
      )}
    </div>
  );
}
