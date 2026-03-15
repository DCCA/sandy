import type { AvatarGroupProps } from "@/lib/schemas/avatar-group";

export function AvatarGroup({ avatars, label, maxVisible }: AvatarGroupProps) {
  const limit = maxVisible ?? avatars.length;
  const visible = avatars.slice(0, limit);
  const overflow = avatars.length - limit;

  return (
    <div
      className="flex items-center gap-3"
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
      }}
    >
      <div className="flex" style={{ direction: "ltr" }}>
        {visible.map((avatar, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={avatar.imageUrl}
            alt={avatar.name}
            title={avatar.name}
            className="size-10 rounded-full object-cover"
            style={{
              border: "2px solid var(--sandy-color-background)",
              marginLeft: i > 0 ? "-0.5rem" : 0,
              position: "relative",
              zIndex: visible.length - i,
            }}
          />
        ))}
        {overflow > 0 && (
          <div
            className="size-10 rounded-full flex items-center justify-center text-xs"
            style={{
              backgroundColor: "var(--sandy-color-secondary)",
              border: "2px solid var(--sandy-color-background)",
              marginLeft: "-0.5rem",
              fontWeight: "var(--sandy-font-heading-weight)",
              color: "var(--sandy-color-muted)",
            } as React.CSSProperties}
          >
            +{overflow}
          </div>
        )}
      </div>
      {label && (
        <span className="text-sm" style={{ color: "var(--sandy-color-muted)" }}>
          {label}
        </span>
      )}
    </div>
  );
}
