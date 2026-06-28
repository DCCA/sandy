import { z } from "zod";
import { safeHref } from "./shared";

export const BottomTabBarSchema = z.object({
  tabs: z
    .array(
      z.object({
        icon: z.string().min(1),
        label: z.string().min(1),
        href: safeHref.optional(),
        active: z.boolean().default(false),
      }),
    )
    .min(2)
    .max(5),
});

export type BottomTabBarProps = z.infer<typeof BottomTabBarSchema>;
