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
        borderLeft: "4px solid var(--sandy-color-primary)",
      }}
    >
      {rating != null && (
        <div className="mb-2 text-lg" aria-label={`${rating} out of 5 stars`}>
          {Array.from({ length: 5 }, (_, i) => (
            <span key={i} style={{ opacity: i < rating ? 1 : 0.25 }}>
              &#9733;
            </span>
          ))}
        </div>
      )}
      <blockquote
        className="text-base m-0 mb-3"
        style={{
          fontStyle: "italic",
          lineHeight: 1.6,
          fontWeight: "var(--sandy-font-body-weight)",
        } as React.CSSProperties}
      >
        &ldquo;{quote}&rdquo;
      </blockquote>
      <div className="flex items-center gap-3">
        {avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt={author}
            className="size-10 rounded-full object-cover"
            style={{ border: "2px solid var(--sandy-color-border)" }}
          />
        )}
        <div>
          <div
            className="text-sm"
            style={{ fontWeight: "var(--sandy-font-heading-weight)" } as React.CSSProperties}
          >
            {author}
          </div>
          {role && (
            <div className="text-xs" style={{ color: "var(--sandy-color-muted)" }}>
              {role}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
