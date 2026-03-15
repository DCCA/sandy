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
      viewport: z.literal("mobile").optional(),
      locale: z.string().optional(),
    })
    .optional(),
});

export type EnvelopeInput = z.input<typeof EnvelopeSchema>;

export const SectionSchema = z.object({
  id: z.string().min(1, "Section id is required"),
  component: z.string().min(1, "Component name is required"),
  props: z.record(z.string(), z.unknown()),
});

export const PageSchema = z.object({
  version: z.string().default("2.0"),
  theme: z
    .object({
      brand: z.string(),
      mode: z.enum(["light", "dark"]),
    })
    .optional(),
  meta: z
    .object({
      viewport: z.literal("mobile").optional(),
      locale: z.string().optional(),
    })
    .optional(),
  sections: z.array(SectionSchema).min(1, "At least one section is required"),
});
