"use client";

import type { PrimitiveNode } from "@/lib/composite/types";

const MAX_DEPTH = 2;

const spacerSizes: Record<string, string> = {
  xs: "8px",
  sm: "16px",
  md: "24px",
  lg: "48px",
};

const gapSizes: Record<string, string> = {
  none: "0",
  xs: "var(--sandy-spacing-xs, 4px)",
  sm: "var(--sandy-spacing-sm, 8px)",
  md: "var(--sandy-spacing-md, 16px)",
  lg: "var(--sandy-spacing-lg, 24px)",
};

const paddingSizes: Record<string, string> = gapSizes;

const headingStyles: Record<string, React.CSSProperties> = {
  h1: {
    fontSize: "2rem",
    fontWeight: "var(--sandy-typography-headingWeight, 700)" as unknown as number,
    lineHeight: 1.2,
  },
  h2: {
    fontSize: "1.5rem",
    fontWeight: "var(--sandy-typography-headingWeight, 700)" as unknown as number,
    lineHeight: 1.3,
  },
  h3: {
    fontSize: "1.25rem",
    fontWeight: "var(--sandy-typography-headingWeight, 700)" as unknown as number,
    lineHeight: 1.4,
  },
  h4: {
    fontSize: "1rem",
    fontWeight: "var(--sandy-typography-headingWeight, 700)" as unknown as number,
    lineHeight: 1.5,
  },
};

const badgeVariants: Record<string, React.CSSProperties> = {
  default: {
    backgroundColor: "var(--sandy-color-muted, #f3f4f6)",
    color: "var(--sandy-color-foreground, #111)",
  },
  success: { backgroundColor: "#dcfce7", color: "#166534" },
  warning: { backgroundColor: "#fef9c3", color: "#854d0e" },
  error: { backgroundColor: "#fce8e8", color: "#991b1b" },
};

const backgroundMap: Record<string, string> = {
  none: "transparent",
  muted: "var(--sandy-color-muted, #f3f4f6)",
  primary: "var(--sandy-color-primary, #3b82f6)",
  secondary: "var(--sandy-color-secondary, #6b7280)",
};

function HeadingRenderer({ props }: { props: Record<string, unknown> }) {
  const text = String(props.text ?? "Heading");
  const level = String(props.level ?? "h2") as keyof typeof headingStyles;
  const align = String(props.align ?? "left") as React.CSSProperties["textAlign"];
  const Tag = level as "h1" | "h2" | "h3" | "h4";
  return (
    <Tag
      style={{
        ...headingStyles[level],
        textAlign: align,
        margin: 0,
        fontFamily: "var(--sandy-typography-fontFamily, inherit)",
        color: "var(--sandy-color-foreground, #111)",
      }}
    >
      {text}
    </Tag>
  );
}

function ParagraphRenderer({ props }: { props: Record<string, unknown> }) {
  const text = String(props.text ?? "");
  const align = String(props.align ?? "left") as React.CSSProperties["textAlign"];
  return (
    <p
      style={{
        textAlign: align,
        margin: 0,
        lineHeight: 1.6,
        color: "var(--sandy-color-foreground, #111)",
        fontFamily: "var(--sandy-typography-fontFamily, inherit)",
      }}
    >
      {text}
    </p>
  );
}

const UNSAFE_HREF_RE = /^\s*(javascript|data|vbscript):/i;

function ButtonRenderer({ props }: { props: Record<string, unknown> }) {
  const label = String(props.label ?? "Button");
  const rawHref = String(props.href ?? "#");
  const href = UNSAFE_HREF_RE.test(rawHref) ? "#" : rawHref;
  const variant = String(props.variant ?? "primary");

  const baseStyle: React.CSSProperties = {
    display: "inline-block",
    padding: "var(--sandy-spacing-sm, 8px) var(--sandy-spacing-md, 16px)",
    borderRadius: "var(--sandy-radius-md, 8px)",
    fontSize: "0.875rem",
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
    border: "none",
    fontFamily: "var(--sandy-typography-fontFamily, inherit)",
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: "var(--sandy-color-primary, #3b82f6)",
      color: "#fff",
    },
    secondary: {
      backgroundColor: "var(--sandy-color-secondary, #6b7280)",
      color: "#fff",
    },
    outline: {
      backgroundColor: "transparent",
      color: "var(--sandy-color-primary, #3b82f6)",
      border: "1px solid var(--sandy-color-border, #e5e7eb)",
    },
  };

  return (
    <a href={href} style={{ ...baseStyle, ...variantStyles[variant] }}>
      {label}
    </a>
  );
}

function ImageRenderer({ props }: { props: Record<string, unknown> }) {
  const src = String(props.src ?? "");
  const alt = String(props.alt ?? "Image");
  const aspectRatio = String(props.aspectRatio ?? "auto");

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      style={{
        width: "100%",
        borderRadius: "var(--sandy-radius-md, 8px)",
        objectFit: "cover",
        aspectRatio: aspectRatio === "auto" ? undefined : aspectRatio.replace(":", "/"),
      }}
    />
  );
}

function SpacerRenderer({ props }: { props: Record<string, unknown> }) {
  const size = String(props.size ?? "md");
  return <div style={{ height: spacerSizes[size] ?? spacerSizes.md }} />;
}

function DividerRenderer({ props }: { props: Record<string, unknown> }) {
  const borderStyle = String(props.style ?? "solid");
  return (
    <hr
      style={{
        border: "none",
        borderTop: `1px ${borderStyle} var(--sandy-color-border, #e5e7eb)`,
        margin: 0,
      }}
    />
  );
}

function BadgeRenderer({ props }: { props: Record<string, unknown> }) {
  const text = String(props.text ?? "Badge");
  const variant = String(props.variant ?? "default");
  return (
    <span
      style={{
        display: "inline-block",
        padding: "2px 8px",
        borderRadius: "var(--sandy-radius-sm, 4px)",
        fontSize: "0.75rem",
        fontWeight: 600,
        ...badgeVariants[variant],
      }}
    >
      {text}
    </span>
  );
}

function ContainerRenderer({
  props,
  nodeChildren,
  depth,
}: {
  props: Record<string, unknown>;
  nodeChildren?: PrimitiveNode[];
  depth: number;
}) {
  const direction = String(props.direction ?? "column");
  const gap = String(props.gap ?? "md");
  const padding = String(props.padding ?? "md");
  const background = String(props.background ?? "none");
  const borderRadius = String(props.borderRadius ?? "none");
  const border = Boolean(props.border);

  const radiusMap: Record<string, string> = {
    none: "0",
    sm: "var(--sandy-radius-sm, 4px)",
    md: "var(--sandy-radius-md, 8px)",
    lg: "var(--sandy-radius-lg, 12px)",
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction === "row" ? "row" : "column",
        gap: gapSizes[gap] ?? gapSizes.md,
        padding: paddingSizes[padding] ?? paddingSizes.md,
        backgroundColor: backgroundMap[background] ?? "transparent",
        borderRadius: radiusMap[borderRadius] ?? "0",
        border: border ? "1px solid var(--sandy-color-border, #e5e7eb)" : "none",
      }}
    >
      {nodeChildren?.map((child) => (
        <NodeRenderer key={child.id} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function NodeRenderer({ node, depth = 0 }: { node: PrimitiveNode; depth?: number }) {
  if (depth > MAX_DEPTH) return null;

  switch (node.type) {
    case "heading":
      return <HeadingRenderer props={node.props} />;
    case "paragraph":
      return <ParagraphRenderer props={node.props} />;
    case "button":
      return <ButtonRenderer props={node.props} />;
    case "image":
      return <ImageRenderer props={node.props} />;
    case "spacer":
      return <SpacerRenderer props={node.props} />;
    case "divider":
      return <DividerRenderer props={node.props} />;
    case "badge":
      return <BadgeRenderer props={node.props} />;
    case "container":
      return <ContainerRenderer props={node.props} nodeChildren={node.children} depth={depth} />;
    default:
      return null;
  }
}
