import { z } from "zod";

export const ModalPreviewSchema = z.object({
  title: z.string(),
  body: z.string(),
  open: z.boolean().default(true),
  actions: z
    .array(
      z.object({
        label: z.string(),
        variant: z.enum(["primary", "secondary", "ghost"]).default("primary"),
      }),
    )
    .optional(),
  size: z.enum(["sm", "md", "lg"]).default("md"),
});

export type ModalPreviewProps = z.infer<typeof ModalPreviewSchema>;
