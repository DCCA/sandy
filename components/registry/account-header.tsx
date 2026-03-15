import type { AccountHeaderProps } from "@/lib/schemas/account-header";

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
        padding: "var(--sandy-spacing-md)",
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: "50%",
          backgroundColor: "var(--sandy-color-primary)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          overflow: "hidden",
          fontSize: 18,
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
          className="text-xs m-0"
          style={{ color: "var(--sandy-color-muted)" }}
        >
          {greeting}
        </p>
        <p
          className="text-base m-0"
          style={
            {
              fontWeight: "var(--sandy-font-heading-weight)",
            } as React.CSSProperties
          }
        >
          {userName}
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
                width: 36,
                height: 36,
                borderRadius: "50%",
                backgroundColor: "var(--sandy-color-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 16,
                cursor: "default",
              }}
            >
              {action.icon}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
