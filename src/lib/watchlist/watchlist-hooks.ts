// Custom hooks for watchlist operations with conflict resolution
import { useState, useEffect, useCallback } from "react";
import {
  getWatchlistRepo,
  addWatchlistRepo,
  removeWatchlistRepo,
} from "@/data/watchlist/watchlist.repo";
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
      const items = await getWatchlistRepo();
      setWatchlist(items);
    } catch (error) {
      console.error("Failed to load watchlist:", error);
    } finally {
      setIsLoading(false);
    }
  }

  function setupSync() {
    return initWatchlistSync((message) => {
      if (message.type === "ADD") {
        setWatchlist((prev) => {
          // Check for conflicts and resolve
          const existing = prev.find((item) => item.id === message.item.id);
          if (existing) {
            // Item already exists, skip
            return prev;
          }
          // Remove vector clock metadata for client
          const { vectorClock, deviceId, lastModified, ...item } = message.item;
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
          message.items.forEach((item) => {
            const { vectorClock, deviceId, lastModified, ...clientItem } = item;
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
      await addWatchlistRepo(movie);
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
      await removeWatchlistRepo(id);
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
