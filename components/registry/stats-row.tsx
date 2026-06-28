import type { StatsRowProps } from "@/lib/schemas/stats-row";

export function StatsRow({ stats }: StatsRowProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        display: "grid",
        gap: "var(--sandy-spacing-md)",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
      }}
    >
      {stats.map((stat, i) => (
        <div
          key={i}
          role="group"
          aria-label={`${stat.value} ${stat.label}`}
          style={{
            textAlign: "center",
            backgroundColor: "var(--sandy-color-secondary)",
            borderRadius: "var(--sandy-radius-md)",
            padding: "var(--sandy-spacing-lg)",
            minWidth: 0,
            overflowWrap: "break-word",
          }}
        >
          <div
            style={
              {
                fontSize: "var(--sandy-font-size-2xl)",
                marginBottom: 4,
                fontWeight: "var(--sandy-font-heading-weight)",
                color: "var(--sandy-color-primary)",
              } as React.CSSProperties
            }
          >
            {stat.value}
          </div>
          <div
            style={
              {
                fontSize: "var(--sandy-font-size-sm)",
                fontWeight: "var(--sandy-font-heading-weight)",
              } as React.CSSProperties
            }
          >
            {stat.label}
          </div>
          {stat.description && (
            <div
              style={{
                fontSize: "var(--sandy-font-size-xs)",
                marginTop: 4,
                color: "var(--sandy-color-muted)",
              }}
            >
              {stat.description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
