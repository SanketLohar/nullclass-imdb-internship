import { z } from "zod";

/* ---------------------------------------
   Review Input Schema
---------------------------------------- */

export const reviewInputSchema = z.object({
  movieId: z.number(),

  authorName: z
    .string()
    .min(2, "Name must be at least 2 characters"),

  rating: z
    .number()
    .min(1)
    .max(10),

  content: z
    .string()
    .min(10, "Review must be at least 10 characters"),
});

/* ---------------------------------------
   Inferred Type
---------------------------------------- */

export type ReviewInput = z.infer<
  typeof reviewInputSchema
>;
