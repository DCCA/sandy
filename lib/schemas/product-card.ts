import { z } from "zod";
import { safeHref } from "./shared";

export const ProductCardSchema = z.object({
  title: z.string(),
  description: z.string(),
  badge: z.string().optional(),
  imageUrl: z.string().url().optional(),
  action: z
    .object({
      label: z.string(),
      href: safeHref,
    })
    .optional(),
});

export type ProductCardProps = z.infer<typeof ProductCardSchema>;
