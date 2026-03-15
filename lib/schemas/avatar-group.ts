import { z } from "zod";

export const AvatarGroupSchema = z.object({
  avatars: z
    .array(
      z.object({
        imageUrl: z.string().url(),
        name: z.string(),
      })
    )
    .min(1),
  label: z.string().optional(),
  maxVisible: z.number().int().min(1).max(10).optional(),
});

export type AvatarGroupProps = z.infer<typeof AvatarGroupSchema>;
