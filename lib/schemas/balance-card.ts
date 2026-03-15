import { z } from "zod";
import { safeHref } from "./shared";

export const BalanceCardSchema = z.object({
  label: z.string().min(1),
  amount: z.string().min(1),
  visible: z.boolean().default(true),
  footnote: z.string().optional(),
  action: z
    .object({
      label: z.string(),
      href: safeHref,
    })
    .optional(),
});

export type BalanceCardProps = z.infer<typeof BalanceCardSchema>;
