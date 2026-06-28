import type { QuickActionsProps } from "@/lib/schemas/quick-actions";
import { renderIcon } from "@/lib/icons";

export function QuickActions({ actions }: QuickActionsProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(80px, 1fr))",
        gap: "var(--sandy-spacing-sm)",
      }}
    >
      {actions.map((action, i) => {
        const ariaLabel = action.badge ? `${action.label}, ${action.badge}` : action.label;
        const content = (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* Icon button with optional badge */}
            <div style={{ position: "relative" }} aria-hidden="true">
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
                overflowWrap: "anywhere",
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
            aria-label={ariaLabel}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {content}
          </a>
        ) : (
          <button
            key={i}
            type="button"
            aria-label={ariaLabel}
            style={{
              all: "unset",
              cursor: "pointer",
              display: "block",
            }}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
