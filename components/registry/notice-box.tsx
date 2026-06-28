import type { NoticeBoxProps } from "@/lib/schemas/notice-box";

const typeConfig: Record<string, { token: string; icon: string }> = {
  info: { token: "var(--sandy-color-info)", icon: "ℹ" },
  warning: { token: "var(--sandy-color-warning)", icon: "⚠" },
  error: { token: "var(--sandy-color-error)", icon: "✕" },
  success: { token: "var(--sandy-color-success)", icon: "✓" },
};

export function NoticeBox({ message, type = "info", title }: NoticeBoxProps) {
  const config = typeConfig[type] ?? typeConfig.info;

  return (
    <div
      className="flex gap-3"
      role="note"
      style={{
        backgroundColor: `color-mix(in srgb, ${config.token} 12%, var(--sandy-color-background))`,
        border: `1px solid ${config.token}`,
        borderRadius: "var(--sandy-radius-md)",
        padding: "var(--sandy-spacing-md)",
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        overflowWrap: "break-word",
      }}
    >
      <span className="text-lg shrink-0" aria-hidden="true" style={{ color: config.token }}>
        {config.icon}
      </span>
      <div>
        {title && (
          <h4
            className="text-sm mb-1"
            style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
          >
            {title}
          </h4>
        )}
        <p className="text-sm m-0">{message}</p>
      </div>
    </div>
  );
}
