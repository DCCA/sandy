import type { QuickActionsProps } from "@/lib/schemas/quick-actions";
import { renderIcon } from "@/lib/icons";

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        display: "flex",
        justifyContent: "space-between",
      }}
    >
      {actions.map((action, i) => {
        const content = (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
              flex: 1,
            }}
          >
            {/* Icon button with optional badge */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: 72,
                  height: 72,
                  borderRadius: "var(--sandy-radius-lg)",
                  backgroundColor: "var(--sandy-color-secondary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "var(--sandy-shadow-sm)",
                  color: "var(--sandy-color-primary)",
                }}
              >
                {renderIcon(action.icon, { size: 28, color: "var(--sandy-color-primary)" })}
              </div>
              {action.badge && (
                <span
                  style={
                    {
                      position: "absolute",
                      bottom: -6,
                      left: "50%",
                      transform: "translateX(-50%)",
                      backgroundColor: "var(--sandy-color-success)",
                      color: "#fff",
                      fontSize: "var(--sandy-font-size-xs)",
                      fontWeight: "var(--sandy-font-heading-weight)",
                      borderRadius: "var(--sandy-radius-full)",
                      padding: "2px 8px",
                      lineHeight: "14px",
                      whiteSpace: "nowrap",
                    } as React.CSSProperties
                  }
                >
                  {action.badge}
                </span>
              )}
            </div>

            {/* Label */}
            <span
              style={{
                fontSize: "var(--sandy-font-size-xs)",
                textAlign: "center" as const,
                color: "var(--sandy-color-foreground)",
                marginTop: action.badge ? 4 : 0,
              }}
            >
              {action.label}
            </span>
          </div>
        );

        return action.href ? (
          <a
            key={i}
            href={action.href}
            style={{ textDecoration: "none", color: "inherit", flex: 1 }}
          >
            {content}
          </a>
        ) : (
          <div key={i} style={{ flex: 1 }}>
            {content}
          </div>
        );
      })}
    </div>
  );
}
