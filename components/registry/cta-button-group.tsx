import type { CTAButtonGroupProps } from "@/lib/schemas/cta-button-group";

const alignmentClasses: Record<string, string> = {
  left: "justify-start",
  center: "justify-center",
  right: "justify-end",
};

function getButtonStyles(variant: string) {
  switch (variant) {
    case "secondary":
      return {
        backgroundColor: "var(--sandy-color-secondary)",
        color: "var(--sandy-color-foreground)",
        border: "1px solid var(--sandy-color-border)",
      };
    case "outline":
      return {
        backgroundColor: "transparent",
        color: "var(--sandy-color-primary)",
        border: "1px solid var(--sandy-color-primary)",
      };
    default:
      return {
        backgroundColor: "var(--sandy-color-primary)",
        color: "#fff",
        border: "none",
      };
  }
}

export function CTAButtonGroup({ buttons, alignment = "left" }: CTAButtonGroupProps) {
  return (
    <div
      className={`flex flex-wrap gap-3 ${alignmentClasses[alignment] ?? ""}`}
      style={{ fontFamily: "var(--sandy-font-family)" }}
    >
      {buttons.map((btn, i) => (
        <a
          key={i}
          href={btn.href}
          className="inline-flex items-center px-5 py-2.5 text-sm font-medium no-underline"
          style={{
            ...getButtonStyles(btn.variant ?? "primary"),
            borderRadius: "var(--sandy-radius-md)",
          }}
        >
          {btn.label}
        </a>
      ))}
    </div>
  );
}
