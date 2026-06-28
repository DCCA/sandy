import { z } from "zod";

export const FeatureListSchema = z.object({
  heading: z.string().optional(),
  features: z
    .array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        icon: z.string().optional(),
      }),
    )
    .min(1),
  columns: z.enum(["1", "2", "3"]).default("3"),
});

export type FeatureListProps = z.infer<typeof FeatureListSchema>;
