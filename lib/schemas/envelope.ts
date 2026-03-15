import { z } from "zod";

export const EnvelopeSchema = z.object({
  component: z.string().min(1, "Component name is required"),
  version: z.string().default("1.0"),
  props: z.record(z.string(), z.unknown()),
  theme: z
    .object({
      brand: z.string(),
      mode: z.enum(["light", "dark"]),
    })
    .optional(),
  slots: z.record(z.string(), z.unknown()).optional(),
  meta: z
    .object({
      viewport: z.enum(["mobile", "tablet", "desktop"]).optional(),
      locale: z.string().optional(),
    })
    .optional(),
});

export type EnvelopeInput = z.input<typeof EnvelopeSchema>;
