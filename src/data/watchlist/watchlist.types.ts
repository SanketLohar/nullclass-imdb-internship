export type WatchlistMovie = {
  id: string;
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
  "addedAt"
>;
