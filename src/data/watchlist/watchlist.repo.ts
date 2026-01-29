import type { WatchlistMovie } from "./watchlist.types";

import {
  idbGetAll,
  idbPut,
  idbDelete,
} from "./watchlist.indexeddb";

export async function getWatchlistRepo(): Promise<
  WatchlistMovie[]
> {
  return idbGetAll();
}

export async function addWatchlistRepo(
  movie: WatchlistMovie
): Promise<void> {
  await idbPut(movie);
}

export async function removeWatchlistRepo(
  id: string
): Promise<void> {
  await idbDelete(id);
}
