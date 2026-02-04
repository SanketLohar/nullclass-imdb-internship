// Zod validation for watchlist
import { z } from "zod";
import { WatchlistMovie } from "./watchlist.types";

export const watchlistMovieSchema = z.object({
  id: z.string().min(1),
  userId: z.string().min(1),
  title: z.string().min(1),
  posterUrl: z.string().url(),
  releaseYear: z.number().int().min(1900).max(2100),
  rating: z.number().min(0).max(10).optional(),
  addedAt: z.number().int().positive(),
  vectorClock: z.record(z.string(), z.number()).optional(),
  deviceId: z.string().optional(),
  updatedAt: z.number().optional()
});

export function validateWatchlistMovie(
  data: unknown
): WatchlistMovie {
  // @ts-ignore - explicitly cast because Zod inference might be slightly strict on optional undefined vs missing
  return watchlistMovieSchema.parse(data) as WatchlistMovie;
}
