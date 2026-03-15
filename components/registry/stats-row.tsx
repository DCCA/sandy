import type { StatsRowProps } from "@/lib/schemas/stats-row";

const columnCounts: Record<string, number> = {
  "2": 2,
  "3": 3,
  "4": 4,
};

export function StatsRow({ stats, columns = "3" }: StatsRowProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        display: "grid",
        gap: "var(--sandy-spacing-md)",
        gridTemplateColumns: `repeat(${columnCounts[columns] ?? 3}, 1fr)`,
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          className="text-center"
          style={{
            backgroundColor: "var(--sandy-color-secondary)",
            borderRadius: "var(--sandy-radius-md)",
            padding: "var(--sandy-spacing-lg)",
          }}
        >
          <div
            className="text-3xl mb-1"
            style={{
              fontWeight: "var(--sandy-font-heading-weight)",
              color: "var(--sandy-color-primary)",
            } as React.CSSProperties}
          >
            {stat.value}
          </div>
          <div
            className="text-sm"
            style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
          >
            {stat.label}
          </div>
          {stat.description && (
            <div className="text-xs mt-1" style={{ color: "var(--sandy-color-muted)" }}>
              {stat.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
