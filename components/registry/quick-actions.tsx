import type { QuickActionsProps } from "@/lib/schemas/quick-actions";

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        display: "flex",
        gap: "var(--sandy-spacing-md)",
        overflowX: "auto",
        padding: "var(--sandy-spacing-sm) 0",
      }}
    >
      {actions.map((action, i) => {
        const content = (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "var(--sandy-spacing-xs)",
              minWidth: 64,
            }}
          >
            {/* Icon circle with optional badge */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: "50%",
                  backgroundColor: "var(--sandy-color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                }}
              >
                {action.icon}
              </div>
              {action.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: -4,
                    right: -4,
                    backgroundColor: "var(--sandy-color-primary)",
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 600,
                    borderRadius: 999,
                    padding: "1px 6px",
                    lineHeight: "16px",
                    whiteSpace: "nowrap",
                  }}
                >
                  {action.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              className="text-xs text-center"
              style={{ color: "var(--sandy-color-muted)" }}
            >
              {action.label}
            </span>
          </div>
        );

        return action.href ? (
          <a
            key={i}
            href={action.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {content}
          </a>
        ) : (
          <div key={i}>{content}</div>
        );
      })}
    </div>
  );
}
