// src/data/reviews/review.schema.ts
import { z } from "zod";

export const reviewSchema = z.object({
  movieId: z.number(),
  content: z.string().min(10, "Review must be at least 10 characters"),
  rating: z.number().min(1).max(10),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
