import { z } from "zod";
import { safeHref } from "./shared";

const PricingTierSchema = z.object({
  name: z.string().min(1),
  price: z.string().min(1),
  period: z.string().optional(),
  features: z.array(z.string()).min(1).max(12),
  cta: z.object({
    label: z.string(),
    href: safeHref,
  }),
  highlighted: z.boolean().optional(),
});

export const PricingTableSchema = z.object({
  heading: z.string().optional(),
  tiers: z.array(PricingTierSchema).min(1).max(5),
});

export type PricingTableProps = z.infer<typeof PricingTableSchema>;
