import type { BottomSheetProps } from "@/lib/schemas/bottom-sheet";
import { renderIcon } from "@/lib/icons";

export function BottomSheet({
  title,
  subtitle,
  items,
  action,
  secondaryAction,
}: BottomSheetProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        display: "flex",
        flexDirection: "column",
        minHeight: 420,
      }}
    >
      {/* Backdrop area */}
      <div
        style={{
          flex: "0 0 40%",
          backgroundColor: "var(--sandy-color-overlay)",
        }}
      />

      {/* Sheet panel */}
      <div
        style={{
          flex: 1,
          backgroundColor: "var(--sandy-color-secondary)",
          borderRadius: "var(--sandy-radius-lg) var(--sandy-radius-lg) 0 0",
          padding: "var(--sandy-spacing-md) var(--sandy-spacing-lg) var(--sandy-spacing-lg)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "var(--sandy-shadow-lg)",
        }}
      >
        {/* Drag handle */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "var(--sandy-spacing-md)",
          }}
        >
          <div
            style={{
              width: 40,
              height: 4,
              borderRadius: "var(--sandy-radius-full)",
              backgroundColor: "var(--sandy-color-border)",
            }}
          />
        </div>

        {/* Title + Subtitle */}
        {title && (
          <h2
            style={{
              margin: 0,
              fontSize: "var(--sandy-font-size-lg)",
              fontWeight: "var(--sandy-font-heading-weight)",
              lineHeight: "var(--sandy-line-height-tight)",
            } as React.CSSProperties}
          >
            {title}
          </h2>
        )}
        {subtitle && (
          <p
            style={{
              margin: 0,
              marginTop: "var(--sandy-spacing-xs)",
              fontSize: "var(--sandy-font-size-sm)",
              color: "var(--sandy-color-muted)",
            }}
          >
            {subtitle}
          </p>
        )}

        {/* Items list */}
        {items && items.length > 0 && (
          <div
            style={{
              marginTop: "var(--sandy-spacing-lg)",
              display: "flex",
              flexDirection: "column",
            }}
          >
            {items.map((item, i) => {
              const row = (
                <div
                  key={`bottom-sheet-item-${i}-${item.label}`}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "var(--sandy-spacing-sm) 0",
                    borderBottom:
                      i < items.length - 1
                        ? "var(--sandy-border-thin) solid var(--sandy-color-border)"
                        : "none",
                  }}
                >
                  <span
                    style={{
                      fontSize: "var(--sandy-font-size-sm)",
                      color: "var(--sandy-color-foreground)",
                    }}
                  >
                    {item.label}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "var(--sandy-spacing-xs)",
                      fontSize: "var(--sandy-font-size-sm)",
                      fontWeight: "var(--sandy-font-heading-weight)",
                      color: item.value
                        ? "var(--sandy-color-foreground)"
                        : "var(--sandy-color-muted)",
                    } as React.CSSProperties}
                  >
                    {item.value ?? ""}
                    {item.href && renderIcon("chevron-right", { size: 16, color: "var(--sandy-color-muted)" })}
                  </span>
                </div>
              );

              return item.href ? (
                <a key={i} href={item.href} style={{ textDecoration: "none", color: "inherit" }}>
                  {row}
                </a>
              ) : (
                row
              );
            })}
          </div>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Action buttons */}
        {(action || secondaryAction) && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--sandy-spacing-sm)",
              marginTop: "var(--sandy-spacing-lg)",
            }}
          >
            {action && (
              <a
                href={action.href}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "var(--sandy-spacing-sm) var(--sandy-spacing-md)",
                  backgroundColor: "var(--sandy-color-primary)",
                  color: "#fff",
                  borderRadius: "var(--sandy-radius-md)",
                  textDecoration: "none",
                  fontWeight: "var(--sandy-font-heading-weight)",
                  fontSize: "var(--sandy-font-size-md)",
                } as React.CSSProperties}
              >
                {action.label}
              </a>
            )}
            {secondaryAction && (
              <a
                href={secondaryAction.href}
                style={{
                  display: "block",
                  textAlign: "center",
                  padding: "var(--sandy-spacing-sm) var(--sandy-spacing-md)",
                  backgroundColor: "transparent",
                  color: "var(--sandy-color-muted)",
                  borderRadius: "var(--sandy-radius-md)",
                  textDecoration: "none",
                  fontWeight: "var(--sandy-font-heading-weight)",
                  fontSize: "var(--sandy-font-size-sm)",
                } as React.CSSProperties}
              >
                {secondaryAction.label}
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
