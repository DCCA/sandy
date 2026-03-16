import type { BottomTabBarProps } from "@/lib/schemas/bottom-tab-bar";
import { renderIcon } from "@/lib/icons";

export function BottomTabBar({ tabs }: BottomTabBarProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        backgroundColor: "var(--sandy-color-secondary)",
        borderRadius: "var(--sandy-radius-lg) var(--sandy-radius-lg) 0 0",
        display: "flex",
        justifyContent: "space-around",
        padding: "var(--sandy-spacing-sm) var(--sandy-spacing-xs)",
        boxShadow: "0 -2px 8px rgba(0,40,100,0.06)",
      }}
    >
      {tabs.map((tab, i) => {
        const isActive = tab.active ?? false;
        const color = isActive
          ? "var(--sandy-color-primary)"
          : "var(--sandy-color-muted)";

        const content = (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "6px 14px",
              borderRadius: 999,
              backgroundColor: isActive ? "var(--sandy-color-background)" : "transparent",
            }}
          >
            <span style={{ lineHeight: 1, color }}>
              {renderIcon(tab.icon, { size: 22, color })}
            </span>
            <span
              style={{
                fontSize: 10,
                color,
                fontWeight: isActive
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
