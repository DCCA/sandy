import { z } from "zod";
import { safeHref } from "./shared";

export const QuickActionsSchema = z.object({
  actions: z
    .array(
      z.object({
        icon: z.string().min(1),
        label: z.string().min(1),
        href: safeHref.optional(),
        badge: z.string().optional(),
      }),
    )
    .min(1)
    .max(8),
});

export type QuickActionsProps = z.infer<typeof QuickActionsSchema>;
