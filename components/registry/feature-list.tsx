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
          className="text-xl mb-4"
          style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
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
            {feature.icon && <span className="text-2xl mb-2 block">{feature.icon}</span>}
            <h3
              className="text-base mb-1"
              style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
            >
              {feature.title}
            </h3>
            {feature.description && (
              <p className="text-sm m-0" style={{ color: "var(--sandy-color-muted)" }}>
                {feature.description}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
