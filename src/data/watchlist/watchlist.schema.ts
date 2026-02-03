// Zod validation for watchlist
import { z } from "zod";
import { WatchlistMovie } from "./watchlist.types";

export const watchlistMovieSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  posterUrl: z.string().url(),
  releaseYear: z.number().int().min(1900).max(2100),
  rating: z.number().min(0).max(10).optional(),
  addedAt: z.number().int().positive(),
});

export function validateWatchlistMovie(
  data: unknown
): WatchlistMovie {
  return watchlistMovieSchema.parse(data);
}
