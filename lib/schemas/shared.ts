import { z } from "zod";

/**
 * Safe href schema that rejects javascript: and data: URIs.
 * Allows relative paths, http(s), mailto, and tel.
 */
export const safeHref = z.string().refine((val) => !val.match(/^\s*(javascript|data|vbscript):/i), {
  message: "Unsafe URL scheme",
});

/** Text alignment shared by text-bearing components. */
export const alignEnum = z.enum(["left", "center", "right"]);

/** A labelled link with a safe href — the common CTA/nav shape. */
export const linkSchema = z.object({
  label: z.string().min(1, "Link label is required"),
  href: safeHref,
});
