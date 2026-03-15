import { z } from "zod";
import { safeHref } from "./shared";

export const CTAButtonGroupSchema = z.object({
  buttons: z
    .array(
      z.object({
        label: z.string(),
        href: safeHref,
        variant: z.enum(["primary", "secondary", "outline"]).default("primary"),
      })
    )
    .min(1)
    .max(4),
  alignment: z.enum(["left", "center", "right"]).default("left"),
});

export type CTAButtonGroupProps = z.infer<typeof CTAButtonGroupSchema>;
