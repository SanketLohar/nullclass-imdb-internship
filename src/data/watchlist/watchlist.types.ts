export type WatchlistMovie = {
  id: string;
  userId: string;
  title: string;
  posterUrl: string;
  releaseYear: number;
  rating?: number;
  addedAt: number;
  // Sync fields
  vectorClock?: Record<string, number>;
  deviceId?: string;
  updatedAt?: number;
};

/**
 * What UI sends
 */
export type WatchlistInput = Omit<
  WatchlistMovie,
  "addedAt" | "userId"
>;
