import { z } from "zod";

export const NoticeBoxSchema = z.object({
  message: z.string(),
  type: z.enum(["info", "warning", "error", "success"]).default("info"),
  title: z.string().optional(),
  dismissible: z.boolean().default(false),
});

export type NoticeBoxProps = z.infer<typeof NoticeBoxSchema>;
