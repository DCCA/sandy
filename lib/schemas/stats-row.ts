import { z } from "zod";

export const StatsRowSchema = z.object({
  stats: z
    .array(
      z.object({
        value: z.string().min(1),
        label: z.string().min(1),
        description: z.string().optional(),
      })
    )
    .min(1),
  columns: z.enum(["2", "3", "4"]).default("3"),
});

export type StatsRowProps = z.infer<typeof StatsRowSchema>;
