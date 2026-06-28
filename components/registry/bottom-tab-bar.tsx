import type { BottomTabBarProps } from "@/lib/schemas/bottom-tab-bar";
import { renderIcon } from "@/lib/icons";

export function BottomTabBar({ tabs }: BottomTabBarProps) {
  return (
    <nav
      aria-label="Primary"
      style={{
        fontFamily: "var(--sandy-font-family)",
        backgroundColor: "var(--sandy-color-secondary)",
        borderRadius: "var(--sandy-radius-lg) var(--sandy-radius-lg) 0 0",
        display: "flex",
        justifyContent: "space-around",
        padding: "var(--sandy-spacing-sm) var(--sandy-spacing-xs)",
        boxShadow: "0 -2px 8px rgba(0,40,100,0.06)",
        margin: 0,
      }}
    >
      {tabs.map((tab, i) => {
        const isActive = tab.active ?? false;
        const color = isActive ? "var(--sandy-color-primary)" : "var(--sandy-color-muted)";

        const content = (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 2,
              padding: "6px 14px",
              borderRadius: "var(--sandy-radius-full)",
              backgroundColor: isActive ? "var(--sandy-color-surface)" : "transparent",
            }}
          >
            <span aria-hidden="true" style={{ lineHeight: 1, color }}>
              {renderIcon(tab.icon, { size: 22, color })}
            </span>
            <span
              style={
                {
                  fontSize: "var(--sandy-font-size-xs)",
                  color,
                  fontWeight: isActive
                    ? ("var(--sandy-font-heading-weight)" as string)
                    : "var(--sandy-font-body-weight)",
                } as React.CSSProperties
              }
            >
              {tab.label}
            </span>
          </div>
        );

        return tab.href ? (
          <a
            key={i}
            href={tab.href}
            aria-label={tab.label}
            aria-current={isActive ? "page" : undefined}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            {content}
          </a>
        ) : (
          <div key={i} aria-current={isActive ? "page" : undefined}>
            {content}
          </div>
        );
      })}
    </nav>
  );
}
