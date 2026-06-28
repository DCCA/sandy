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

export function ModalPreview({
  title,
  body,
  open = true,
  actions,
  size = "md",
}: ModalPreviewProps) {
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-preview-title"
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
        <button
          type="button"
          aria-label="Close"
          className="absolute flex items-center justify-center text-lg leading-none"
          style={{
            top: "var(--sandy-spacing-md)",
            right: "var(--sandy-spacing-md)",
            width: 28,
            height: 28,
            backgroundColor: "transparent",
            border: "none",
            color: "var(--sandy-color-muted)",
            cursor: "pointer",
            borderRadius: "var(--sandy-radius-sm)",
          }}
        >
          <span aria-hidden="true">&times;</span>
        </button>
        <h2
          id="modal-preview-title"
          className="text-lg mb-2"
          style={
            {
              fontWeight: "var(--sandy-font-heading-weight)",
              paddingRight: "var(--sandy-spacing-lg)",
              overflowWrap: "break-word",
            } as React.CSSProperties
          }
        >
          {title}
        </h2>
        <p
          className="text-sm mb-4"
          style={{ color: "var(--sandy-color-muted)", overflowWrap: "break-word" }}
        >
          {body}
        </p>
        {actions && actions.length > 0 && (
          <div className="flex flex-wrap justify-end gap-2">
            {actions.map((action, i) => (
              <button
                key={i}
                type="button"
                aria-label={action.label}
                className="px-4 py-2 text-sm font-medium"
                style={{
                  ...getActionStyles(action.variant ?? "primary"),
                  borderRadius: "var(--sandy-radius-sm)",
                  border: "none",
                  cursor: "pointer",
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
