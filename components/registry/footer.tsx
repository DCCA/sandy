import type { FooterProps } from "@/lib/schemas/footer";

export function Footer({ columns, bottomText }: FooterProps) {
  return (
    <footer
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        backgroundColor: "var(--sandy-color-secondary)",
        borderRadius: "var(--sandy-radius-lg)",
        padding: "var(--sandy-spacing-lg)",
      }}
    >
      <div
        style={{
          display: "grid",
          gap: "var(--sandy-spacing-lg)",
          gridTemplateColumns: `repeat(${Math.min(columns.length, 4)}, 1fr)`,
        }}
      >
        {columns.map((col, i) => (
          <div key={i}>
            <h4
              className="text-sm mb-3"
              style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
            >
              {col.heading}
            </h4>
            <ul className="list-none p-0 m-0" style={{ display: "flex", flexDirection: "column", gap: "var(--sandy-spacing-sm)" }}>
              {col.links.map((link, li) => (
                <li key={li}>
                  <a
                    href={link.href}
                    className="text-sm"
                    style={{
                      color: "var(--sandy-color-muted)",
                      textDecoration: "none",
                    }}
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      {bottomText && (
        <div
          className="text-xs mt-4 pt-4 text-center"
          style={{
            color: "var(--sandy-color-muted)",
            borderTop: "1px solid var(--sandy-color-border)",
          }}
        >
          {bottomText}
        </div>
      )}
    </footer>
  );
}
