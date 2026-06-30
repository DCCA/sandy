import { z } from "zod";
import { safeHref } from "@/lib/schemas/shared";
import type { PrimitiveType } from "./types";

const headingSchema = z.object({
  text: z.string().default("Heading"),
  level: z.enum(["h1", "h2", "h3", "h4"]).default("h2"),
  align: z.enum(["left", "center", "right"]).default("left"),
});

const paragraphSchema = z.object({
  text: z.string().default("Paragraph text"),
  align: z.enum(["left", "center", "right"]).default("left"),
});

const buttonSchema = z.object({
  label: z.string().default("Button"),
  href: safeHref.default("#"),
  variant: z.enum(["primary", "secondary", "outline"]).default("primary"),
});

const imageSchema = z.object({
  src: z.string().url().default("https://placehold.co/600x400"),
  alt: z.string().default("Image"),
  aspectRatio: z.enum(["auto", "1:1", "4:3", "16:9"]).default("auto"),
});

const spacerSchema = z.object({
  size: z.enum(["xs", "sm", "md", "lg"]).default("md"),
});

const dividerSchema = z.object({
  style: z.enum(["solid", "dashed", "dotted"]).default("solid"),
});

const badgeSchema = z.object({
  text: z.string().default("Badge"),
  variant: z.enum(["default", "success", "warning", "error"]).default("default"),
});

const containerSchema = z.object({
  direction: z.enum(["row", "column"]).default("column"),
  gap: z.enum(["none", "xs", "sm", "md", "lg"]).default("md"),
  padding: z.enum(["none", "xs", "sm", "md", "lg"]).default("md"),
  background: z.enum(["none", "muted", "primary", "secondary"]).default("none"),
  borderRadius: z.enum(["none", "sm", "md", "lg"]).default("none"),
  border: z.boolean().default(false),
});

export const primitiveSchemas: Record<PrimitiveType, z.ZodType> = {
  heading: headingSchema,
  paragraph: paragraphSchema,
  button: buttonSchema,
  image: imageSchema,
  spacer: spacerSchema,
  divider: dividerSchema,
  badge: badgeSchema,
  container: containerSchema,
};

export function getDefaultProps(type: PrimitiveType): Record<string, unknown> {
  const schema = primitiveSchemas[type];
  const result = schema.safeParse({});
  return result.success ? (result.data as Record<string, unknown>) : {};
}

export const primitiveLabels: Record<PrimitiveType, string> = {
  heading: "Heading",
  paragraph: "Paragraph",
  button: "Button",
  image: "Image",
  spacer: "Spacer",
  divider: "Divider",
  badge: "Badge",
  container: "Container",
};
