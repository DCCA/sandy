import { z } from "zod";
import { safeHref } from "./shared";

export const BottomSheetSchema = z.object({
  title: z.string().optional(),
  subtitle: z.string().optional(),
  items: z
    .array(
      z.object({
        label: z.string().min(1),
        value: z.string().optional(),
        href: safeHref.optional(),
      }),
    )
    .optional(),
  action: z
    .object({
      label: z.string(),
      href: safeHref,
    })
    .optional(),
  secondaryAction: z
    .object({
      label: z.string(),
      href: safeHref,
    })
    .optional(),
});

export type BottomSheetProps = z.infer<typeof BottomSheetSchema>;
