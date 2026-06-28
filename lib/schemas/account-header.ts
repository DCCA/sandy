import { z } from "zod";

export const AccountHeaderSchema = z.object({
  greeting: z.string().min(1),
  userName: z.string().min(1),
  avatarUrl: z.string().url().optional(),
  actions: z
    .array(
      z.object({
        icon: z.string().min(1),
        label: z.string().min(1),
      }),
    )
    .default([]),
});

export type AccountHeaderProps = z.infer<typeof AccountHeaderSchema>;
