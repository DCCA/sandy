import { z } from "zod";
import { safeHref } from "./shared";

export const PromoBannerSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  href: safeHref,
  variant: z.enum(["info", "warning", "success"]).default("info"),
  dismissible: z.boolean().default(false),
});

export type PromoBannerProps = z.infer<typeof PromoBannerSchema>;
