import type { AccountHeaderProps } from "@/lib/schemas/account-header";
import { renderIcon } from "@/lib/icons";

export function AccountHeader({
  greeting,
  userName,
  avatarUrl,
  actions = [],
}: AccountHeaderProps) {
  const initial = userName.charAt(0).toUpperCase();

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
      {/* Avatar */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--sandy-radius-full)",
          backgroundColor: "var(--sandy-color-primary)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
          fontSize: "var(--sandy-font-size-xl)",
          fontWeight: "var(--sandy-font-heading-weight)",
        } as React.CSSProperties}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={userName}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          initial
        )}
      </div>

      {/* Greeting + Name */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            margin: 0,
            fontSize: "var(--sandy-font-size-lg)",
            fontWeight: "var(--sandy-font-heading-weight)",
            lineHeight: "var(--sandy-line-height-tight)",
          } as React.CSSProperties}
        >
          {greeting}, {userName}
        </p>
      </div>

      {/* Action icons */}
      {actions.length > 0 && (
        <div style={{ display: "flex", gap: "var(--sandy-spacing-sm)" }}>
          {actions.map((action, i) => (
            <div
              key={i}
              title={action.label}
              style={{
                width: 40,
                height: 40,
                borderRadius: "var(--sandy-radius-full)",
                border: "var(--sandy-border-thin) solid var(--sandy-color-primary)",
                backgroundColor: "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--sandy-color-primary)",
                cursor: "default",
              }}
            >
              {renderIcon(action.icon, { size: 20, color: "var(--sandy-color-primary)" })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
