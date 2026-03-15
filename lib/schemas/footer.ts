import { z } from "zod";
import { safeHref } from "./shared";

export const FooterSchema = z.object({
  columns: z
    .array(
      z.object({
        heading: z.string(),
        links: z
          .array(
            z.object({
              label: z.string(),
              href: safeHref,
            })
          )
          .min(1),
      })
    )
    .min(1)
    .max(5),
  bottomText: z.string().optional(),
});

export type FooterProps = z.infer<typeof FooterSchema>;
