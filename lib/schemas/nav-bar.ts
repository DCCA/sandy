import { z } from "zod";
import { safeHref } from "./shared";

export const NavBarSchema = z.object({
  logo: z
    .object({
      text: z.string().optional(),
      imageUrl: z.string().url().optional(),
    })
    .optional(),
  links: z
    .array(
      z.object({
        label: z.string(),
        href: safeHref,
      }),
    )
    .default([]),
  cta: z
    .object({
      label: z.string(),
      href: safeHref,
    })
    .optional(),
});

export type NavBarProps = z.infer<typeof NavBarSchema>;
