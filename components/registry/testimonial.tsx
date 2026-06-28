import type { TestimonialProps } from "@/lib/schemas/testimonial";

export function Testimonial({ quote, author, role, avatarUrl, rating }: TestimonialProps) {
  return (
    <div
      style={{
        fontFamily: "var(--sandy-font-family)",
        color: "var(--sandy-color-foreground)",
        backgroundColor: "var(--sandy-color-secondary)",
        borderRadius: "var(--sandy-radius-lg)",
        padding: "var(--sandy-spacing-lg)",
        borderLeft: "var(--sandy-border-thick) solid var(--sandy-color-primary)",
      }}
    >
      {rating != null && (
        <div
          style={{ marginBottom: "var(--sandy-spacing-sm)", fontSize: "var(--sandy-font-size-lg)" }}
          aria-label={`${rating} out of 5 stars`}
        >
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ opacity: i < rating ? 1 : 0.25 }}>
              &#9733;
            </span>
          ))}
        </div>
      )}
      <blockquote
        style={
          {
            margin: 0,
            marginBottom: "var(--sandy-spacing-sm)",
            fontSize: "var(--sandy-font-size-md)",
            fontStyle: "italic",
            lineHeight: "var(--sandy-line-height-relaxed)",
            fontWeight: "var(--sandy-font-body-weight)",
          } as React.CSSProperties
        }
      >
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--sandy-spacing-sm)" }}>
        {avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={author}
            style={{
              width: 40,
              height: 40,
              borderRadius: "var(--sandy-radius-full)",
              objectFit: "cover",
              border: "var(--sandy-border-thick) solid var(--sandy-color-border)",
            }}
          />
        )}
        <div>
          <div
            style={
              {
                fontSize: "var(--sandy-font-size-sm)",
                fontWeight: "var(--sandy-font-heading-weight)",
              } as React.CSSProperties
            }
          >
            {author}
          </div>
          {role && (
            <div
              style={{ fontSize: "var(--sandy-font-size-xs)", color: "var(--sandy-color-muted)" }}
            >
              {role}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
