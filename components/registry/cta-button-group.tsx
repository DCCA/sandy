import type { CTAButtonGroupProps } from "@/lib/schemas/cta-button-group";

function getButtonStyles(variant: string) {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: "var(--sandy-color-secondary)",
        color: "var(--sandy-color-foreground)",
        border: "var(--sandy-border-thin) solid var(--sandy-color-border)",
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        color: "var(--sandy-color-primary)",
        border: "var(--sandy-border-thin) solid var(--sandy-color-primary)",
      };
    default:
      return {
        backgroundColor: "var(--sandy-color-primary)",
        color: "#fff",
        border: "none",
      };
  }
}

const justifyMap: Record<string, string> = {
  left: "flex-start",
  center: "center",
  right: "flex-end",
};

export function CTAButtonGroup({ buttons, alignment = "left" }: CTAButtonGroupProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        display: "flex",
        flexWrap: "wrap",
        gap: "var(--sandy-spacing-sm)",
        justifyContent: justifyMap[alignment] ?? "flex-start",
      }}
    >
      {buttons.map((btn, i) => (
        <a
          key={i}
          href={btn.href}
          style={
            {
              ...getButtonStyles(btn.variant ?? "primary"),
              display: "inline-flex",
              alignItems: "center",
              padding: "var(--sandy-spacing-sm) var(--sandy-spacing-lg)",
              fontSize: "var(--sandy-font-size-sm)",
              fontWeight: "var(--sandy-font-heading-weight)",
              borderRadius: "var(--sandy-radius-md)",
              textDecoration: "none",
            } as React.CSSProperties
          }
        >
          {btn.label}
        </a>
      ))}
    </div>
  );
}
