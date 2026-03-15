import { z } from "zod";

export const TestimonialSchema = z.object({
  quote: z.string().min(1),
  author: z.string().min(1),
  role: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  rating: z.number().int().min(1).max(5).optional(),
});

export type TestimonialProps = z.infer<typeof TestimonialSchema>;
