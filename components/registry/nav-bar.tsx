import type { NavBarProps } from "@/lib/schemas/nav-bar";

export function NavBar({ logo, links = [], cta }: NavBarProps) {
  return (
    <nav
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        backgroundColor: "var(--sandy-color-secondary)",
        borderRadius: "var(--sandy-radius-md)",
        padding: "var(--sandy-spacing-sm) var(--sandy-spacing-md)",
        display: "flex",
        alignItems: "center",
        gap: "var(--sandy-spacing-md)",
      }}
    >
      {logo && (
        <div className="flex items-center gap-2 shrink-0">
          {logo.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo.imageUrl}
              alt={logo.text ?? "Logo"}
              className="h-8 w-auto"
            />
          )}
          {logo.text && (
            <span
              className="text-base"
              style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
            >
              {logo.text}
            </span>
          )}
        </div>
      )}
      <div className="flex items-center gap-1 flex-1">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.href}
            className="text-sm px-3 py-1.5 rounded-md"
            style={{
              color: "var(--sandy-color-foreground)",
              textDecoration: "none",
              borderRadius: "var(--sandy-radius-sm)",
            }}
          >
            {link.label}
          </a>
        ))}
      </div>
      {cta && (
        <a
          href={cta.href}
          className="text-sm px-4 py-1.5 shrink-0"
          style={{
            backgroundColor: "var(--sandy-color-primary)",
            color: "#fff",
            borderRadius: "var(--sandy-radius-md)",
            textDecoration: "none",
            fontWeight: "var(--sandy-font-heading-weight)",
          } as React.CSSProperties}
        >
          {cta.label}
        </a>
      )}
    </nav>
  );
}
