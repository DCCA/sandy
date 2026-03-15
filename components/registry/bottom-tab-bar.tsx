import type { BottomTabBarProps } from "@/lib/schemas/bottom-tab-bar";

export function BottomTabBar({ tabs }: BottomTabBarProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        backgroundColor: "var(--sandy-color-background)",
        borderTop: "1px solid var(--sandy-color-border)",
        display: "flex",
        justifyContent: "space-around",
        padding: "var(--sandy-spacing-xs) 0",
      }}
    >
      {tabs.map((tab, i) => {
        const color = tab.active
          ? "var(--sandy-color-primary)"
          : "var(--sandy-color-muted)";

        const content = (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "var(--sandy-spacing-xs)",
            }}
          >
            <span style={{ fontSize: 20, lineHeight: 1, color }}>{tab.icon}</span>
            <span
              className="text-xs"
              style={{
                color,
                fontWeight: tab.active
                  ? ("var(--sandy-font-heading-weight)" as string)
                  : "var(--sandy-font-body-weight)",
              } as React.CSSProperties}
            >
              {tab.label}
            </span>
          </div>
        );

        return tab.href ? (
          <a
            key={i}
            href={tab.href}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {content}
          </a>
        ) : (
          <div key={i}>{content}</div>
        );
      })}
    </div>
  );
}
