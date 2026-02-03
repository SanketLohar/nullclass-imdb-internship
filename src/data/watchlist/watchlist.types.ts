export type WatchlistMovie = {
  id: string;
  userId: string;
  title: string;
  posterUrl: string;
  releaseYear: number;
  rating?: number;
  addedAt: number;
};

/**
 * What UI sends
 */
export type WatchlistInput = Omit<
  WatchlistMovie,
  "addedAt" | "userId"
>;
