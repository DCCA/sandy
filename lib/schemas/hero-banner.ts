import { z } from "zod";
import { safeHref } from "./shared";

export const HeroBannerSchema = z.object({
  title: z.string().min(1),
  subtitle: z.string().optional(),
  cta: z
    .object({
      label: z.string(),
      href: safeHref,
    })
    .optional(),
  align: z.enum(["left", "center"]).default("left"),
});

export type HeroBannerProps = z.infer<typeof HeroBannerSchema>;
