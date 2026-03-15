import type { NoticeBoxProps } from "@/lib/schemas/notice-box";

const typeConfig: Record<string, { bg: string; border: string; icon: string }> = {
  info: { bg: "#eff6ff", border: "#3b82f6", icon: "ℹ" },
  warning: { bg: "#fffbeb", border: "#f59e0b", icon: "⚠" },
  error: { bg: "#fef2f2", border: "#ef4444", icon: "✕" },
  success: { bg: "#f0fdf4", border: "#22c55e", icon: "✓" },
};

export function NoticeBox({ message, type = "info", title }: NoticeBoxProps) {
  const config = typeConfig[type] ?? typeConfig.info;

  return (
    <div
      className="flex gap-3"
      style={{
        backgroundColor: config.bg,
        border: `1px solid ${config.border}`,
        borderRadius: "var(--sandy-radius-md)",
        padding: "var(--sandy-spacing-md)",
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
      }}
    >
      <span className="text-lg shrink-0" style={{ color: config.border }}>
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
