import type { NavBarProps } from "@/lib/schemas/nav-bar";

export function NavBar({ logo, links = [], cta }: NavBarProps) {
  return (
    <header
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        backgroundColor: "var(--sandy-color-secondary)",
        borderRadius: "var(--sandy-radius-md)",
        padding: "var(--sandy-spacing-sm) var(--sandy-spacing-md)",
        display: "flex",
        alignItems: "center",
        gap: "var(--sandy-spacing-md)",
        flexWrap: "wrap",
      }}
    >
      {logo && (
        <div className="flex items-center gap-2 shrink-0">
          {logo.imageUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo.imageUrl} alt={logo.text ?? "Logo"} className="h-8 w-auto" />
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
      <nav aria-label="Primary" className="flex-1 min-w-0">
        <ul className="flex items-center gap-1 flex-wrap list-none p-0 m-0">
          {links.map((link, i) => (
            <li key={i}>
              <a
                href={link.href}
                className="text-sm px-3 py-1.5 rounded-md inline-block"
                style={{
                  color: "var(--sandy-color-foreground)",
                  textDecoration: "none",
                  borderRadius: "var(--sandy-radius-sm)",
                }}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      {cta && (
        <a
          href={cta.href}
          className="text-sm px-4 py-1.5 shrink-0"
          style={
            {
              backgroundColor: "var(--sandy-color-primary)",
              color: "#fff",
              borderRadius: "var(--sandy-radius-md)",
              textDecoration: "none",
              fontWeight: "var(--sandy-font-heading-weight)",
            } as React.CSSProperties
          }
        >
          {cta.label}
        </a>
      )}
    </header>
  );
}
