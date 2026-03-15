import { z } from "zod";
import { safeHref } from "./shared";

export const TransactionListSchema = z.object({
  heading: z.string().optional(),
  transactions: z
    .array(
      z.object({
        title: z.string().min(1),
        subtitle: z.string().optional(),
        amount: z.string().min(1),
        timestamp: z.string().optional(),
        type: z
          .enum(["sent", "received", "payment", "investment"])
          .default("payment"),
      })
    )
    .min(1),
  showAllLabel: z.string().optional(),
  showAllHref: safeHref.optional(),
});

export type TransactionListProps = z.infer<typeof TransactionListSchema>;
