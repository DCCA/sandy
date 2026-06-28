import type { PricingTableProps } from "@/lib/schemas/pricing-table";

export function PricingTable({ heading, tiers }: PricingTableProps) {
  return (
    <div style={{ fontFamily: "var(--sandy-font-family)", color: "var(--sandy-color-foreground)" }}>
      {heading && (
        <h2
          className="text-xl mb-4 text-center"
          style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
        >
          {heading}
        </h2>
      )}
      <div
        style={{
          display: "grid",
          gap: "var(--sandy-spacing-md)",
          gridTemplateColumns: `repeat(${Math.min(tiers.length, 3)}, 1fr)`,
        }}
      >
        {tiers.map((tier, i) => (
          <div
            key={i}
            style={{
              backgroundColor: tier.highlighted
                ? "var(--sandy-color-primary)"
                : "var(--sandy-color-secondary)",
              color: tier.highlighted ? "#fff" : "inherit",
              borderRadius: "var(--sandy-radius-lg)",
              padding: "var(--sandy-spacing-lg)",
              display: "flex",
              flexDirection: "column",
              border: tier.highlighted ? "none" : "1px solid var(--sandy-color-border)",
            }}
          >
            <h3
              className="text-lg mb-1"
              style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
            >
              {tier.name}
            </h3>
            <div className="mb-3">
              <span
                className="text-2xl"
                style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
              >
                {tier.price}
              </span>
              {tier.period && (
                <span className="text-sm ml-1" style={{ opacity: 0.7 }}>
                  /{tier.period}
                </span>
              )}
            </div>
            <ul
              className="list-none p-0 m-0 mb-4 flex-1"
              style={{ display: "flex", flexDirection: "column", gap: "var(--sandy-spacing-sm)" }}
            >
              {tier.features.map((feature, fi) => (
                <li key={fi} className="text-sm flex items-start gap-2">
                  <span
                    style={{
                      color: tier.highlighted ? "#fff" : "var(--sandy-color-primary)",
                      flexShrink: 0,
                    }}
                  >
                    &#10003;
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
            <a
              href={tier.cta.href}
              className="inline-block text-center px-4 py-2 text-sm font-medium"
              style={{
                backgroundColor: tier.highlighted ? "#fff" : "var(--sandy-color-primary)",
                color: tier.highlighted ? "var(--sandy-color-primary)" : "#fff",
                borderRadius: "var(--sandy-radius-md)",
                textDecoration: "none",
              }}
            >
              {tier.cta.label}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
