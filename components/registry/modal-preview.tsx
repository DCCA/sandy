import type { ModalPreviewProps } from "@/lib/schemas/modal-preview";

const sizeWidths: Record<string, string> = {
  sm: "320px",
  md: "480px",
  lg: "640px",
};

function getActionStyles(variant: string) {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: "var(--sandy-color-secondary)",
        color: "var(--sandy-color-foreground)",
      };
    case "ghost":
      return {
        backgroundColor: "transparent",
        color: "var(--sandy-color-muted)",
      };
    default:
      return {
        backgroundColor: "var(--sandy-color-primary)",
        color: "#fff",
      };
  }
}

export function ModalPreview({ title, body, open = true, actions, size = "md" }: ModalPreviewProps) {
  if (!open) {
    return (
      <div
        className="text-sm text-center py-8"
        style={{ color: "var(--sandy-color-muted)", fontFamily: "var(--sandy-font-family)" }}
      >
        Modal is closed. Set &quot;open&quot; to true to preview.
      </div>
    );
  }

  return (
    <div
      className="relative flex items-center justify-center py-8"
      style={{ fontFamily: "var(--sandy-font-family)" }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 rounded-lg" style={{ backgroundColor: "rgba(0,0,0,0.4)" }} />

      {/* Modal */}
      <div
        className="relative w-full"
        style={{
          maxWidth: sizeWidths[size] ?? sizeWidths.md,
          backgroundColor: "var(--sandy-color-background)",
          borderRadius: "var(--sandy-radius-lg)",
          boxShadow: "var(--sandy-shadow-md)",
          padding: "var(--sandy-spacing-lg)",
          color: "var(--sandy-color-foreground)",
        }}
      >
        <h2
          className="text-lg mb-2"
          style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
        >
          {title}
        </h2>
        <p className="text-sm mb-4" style={{ color: "var(--sandy-color-muted)" }}>
          {body}
        </p>
        {actions && actions.length > 0 && (
          <div className="flex justify-end gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                type="button"
                className="px-4 py-2 text-sm font-medium"
                style={{
                  ...getActionStyles(action.variant ?? "primary"),
                  borderRadius: "var(--sandy-radius-sm)",
                  border: "none",
                  cursor: "default",
                }}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
