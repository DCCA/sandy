import { z } from "zod";
import { safeHref } from "./shared";

export const InfoCardGridSchema = z.object({
  cards: z
    .array(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        value: z.string().optional(),
        footnote: z.string().optional(),
        action: z
          .object({
            label: z.string(),
            href: safeHref,
          })
          .optional(),
      })
    )
    .min(1)
    .max(8),
});

export type InfoCardGridProps = z.infer<typeof InfoCardGridSchema>;
