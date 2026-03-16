import type { FeatureListProps } from "@/lib/schemas/feature-list";

const columnCounts: Record<string, number> = {
  "1": 1,
  "2": 2,
  "3": 3,
};

export function FeatureList({ heading, features, columns = "3" }: FeatureListProps) {
  return (
    <div style={{ fontFamily: "var(--sandy-font-family)", color: "var(--sandy-color-foreground)" }}>
      {heading && (
        <h2
          style={{
            margin: 0,
            marginBottom: "var(--sandy-spacing-md)",
            fontSize: "var(--sandy-font-size-xl)",
            fontWeight: "var(--sandy-font-heading-weight)",
          } as React.CSSProperties}
        >
          {heading}
        </h2>
      )}
      <div
        style={{
          display: "grid",
          gap: "var(--sandy-spacing-md)",
          gridTemplateColumns: `repeat(${columnCounts[columns] ?? 3}, 1fr)`,
        }}
      >
        {features.map((feature, i) => (
          <div
            key={i}
            style={{
              backgroundColor: "var(--sandy-color-secondary)",
              borderRadius: "var(--sandy-radius-md)",
              padding: "var(--sandy-spacing-md)",
            }}
          >
            {feature.icon && (
              <span style={{ fontSize: "var(--sandy-font-size-2xl)", display: "block", marginBottom: "var(--sandy-spacing-sm)" }}>
                {feature.icon}
              </span>
            )}
            <h3
              style={{
                margin: 0,
                marginBottom: 4,
                fontSize: "var(--sandy-font-size-md)",
                fontWeight: "var(--sandy-font-heading-weight)",
              } as React.CSSProperties}
            >
              {feature.title}
            </h3>
            {feature.description && (
              <p style={{ margin: 0, fontSize: "var(--sandy-font-size-sm)", color: "var(--sandy-color-muted)" }}>
                {feature.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
