import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Lowercase a string into a slug: runs of non-alphanumerics collapse to
 * `separator`, leading/trailing separators are stripped, and an empty result
 * falls back to `fallback`. `separator` is always a caller-literal ("-"/"_").
 */
export function slugify(value: string, separator = "-", fallback = ""): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, separator)
      .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "") || fallback
  );
}
