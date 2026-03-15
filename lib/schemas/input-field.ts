import { z } from "zod";

export const InputFieldSchema = z.object({
  label: z.string(),
  placeholder: z.string().optional(),
  type: z.enum(["text", "email", "password", "number"]).default("text"),
  required: z.boolean().default(false),
  helperText: z.string().optional(),
  error: z.string().optional(),
});

export type InputFieldProps = z.infer<typeof InputFieldSchema>;
