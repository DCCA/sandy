import { z } from "zod";

/**
 * Safe href schema that rejects javascript: and data: URIs.
 * Allows relative paths, http(s), mailto, and tel.
 */
export const safeHref = z
  .string()
  .refine(
    (val) => !val.match(/^\s*(javascript|data|vbscript):/i),
    { message: "Unsafe URL scheme" }
  );
