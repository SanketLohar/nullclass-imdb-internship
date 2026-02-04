// Custom hooks for watchlist operations with conflict resolution
import { useState, useEffect, useCallback } from "react";
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "@/data/watchlist/watchlist.storage";
import {
  initWatchlistSync,
  broadcastAdd,
  broadcastRemove,
  getDeviceId,
} from "@/data/watchlist/watchlist.sync";
import {
  createVectorClock,
  WatchlistItemWithClock,
} from "@/data/watchlist/watchlist.conflict";
import { WatchlistMovie } from "@/data/watchlist/watchlist.types";

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<WatchlistMovie[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWatchlist();
    setupSync();
  }, []);

  async function loadWatchlist() {
    try {
      const items = await getWatchlist(getDeviceId()); // Wait, getWatchlist requires userId. I need userId. 
      // The hook doesn't seem to have userId.
      // `useWatchlist` might need context or assume single user for this "device".
      // `watchlist.storage.ts` `getWatchlist(userId)` requires it.
      // `getDeviceId()` is in `watchlist.sync` (which I'm about to create) or `watchlist.storage` (local helper).
      // I should export `getDeviceId` from `watchlist.storage` or `watchlist.sync`.
      // Let's assume `getDeviceId` is available from imports.
      // But `getWatchlist` needs it.
      // I'll update line 31.
      setWatchlist(items);
    } catch (error) {
      console.error("Failed to load watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function setupSync() {
    return initWatchlistSync((message: any) => {
      if (message.type === "ADD") {
        setWatchlist((prev) => {
          // Check for conflicts and resolve
          const existing = prev.find((item) => item.id === message.item.id);
          if (existing) {
            // Item already exists, skip
            return prev;
          }
          // Remove vector clock metadata for client
          const { vectorClock, deviceId, updatedAt, ...item } = message.item;
          // @ts-ignore
          return [...prev, item];
        });
      } else if (message.type === "REMOVE") {
        setWatchlist((prev) => prev.filter((item) => item.id !== message.itemId));
      } else if (message.type === "SYNC_RESPONSE") {
        // Merge with existing watchlist, resolving conflicts
        setWatchlist((prev) => {
          const merged = new Map<string, WatchlistMovie>();

          // Add existing items
          prev.forEach((item) => merged.set(item.id, item));

          // Add/update with synced items (remove metadata)
          message.items.forEach((item: any) => {
            const { vectorClock, deviceId, updatedAt, ...clientItem } = item;
            merged.set(clientItem.id, clientItem);
          });

          return Array.from(merged.values());
        });
      }
    });
  }

  const add = useCallback(async (movie: WatchlistMovie) => {
    // Optimistic update
    setWatchlist((prev) => [...prev, movie]);

    try {
      await addToWatchlist(movie);
      broadcastAdd(movie);
    } catch (error) {
      // Rollback on error
      setWatchlist((prev) => prev.filter((item) => item.id !== movie.id));
      throw error;
    }
  }, []);

  const remove = useCallback(async (id: string) => {
    // Optimistic update
    const removed = watchlist.find((item) => item.id === id);
    setWatchlist((prev) => prev.filter((item) => item.id !== id));

    try {
      await removeFromWatchlist(getDeviceId(), id);
      broadcastRemove(id, createVectorClock(getDeviceId()));
    } catch (error) {
      // Rollback on error
      if (removed) {
        setWatchlist((prev) => [...prev, removed]);
      }
      throw error;
    }
  }, [watchlist]);

  const toggle = useCallback(async (movie: WatchlistMovie) => {
    const exists = watchlist.some((item) => item.id === movie.id);
    if (exists) {
      await remove(movie.id);
    } else {
      await add(movie);
    }
  }, [watchlist, add, remove]);

  const isSaved = useCallback((id: string) => {
    return watchlist.some((item) => item.id === id);
  }, [watchlist]);

  return {
    list: watchlist,
    isLoading,
    add,
    remove,
    toggle,
    isSaved,
    refresh: loadWatchlist,
  };
}
