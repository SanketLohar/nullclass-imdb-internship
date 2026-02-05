"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "@/context/auth/auth.context";

import type {
  WatchlistMovie,
  WatchlistInput,
} from "@/data/watchlist/watchlist.types";

import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from "@/data/watchlist/watchlist.storage";

/* ---------------------------------------
   TYPES
---------------------------------------- */

type ToastState = {
  message: string;
  undo?: () => void;
};

type WatchlistContextType = {
  list: WatchlistMovie[];
  toggle: (movie: WatchlistInput) => Promise<void>;
  isSaved: (id: string | number) => boolean;
  toast: ToastState | null;
  isLoading: boolean;
};

/* ---------------------------------------
   CONTEXT
---------------------------------------- */

const WatchlistContext =
  createContext<WatchlistContextType | null>(null);

const CHANNEL = "watchlist-sync";

/* ---------------------------------------
   PROVIDER
---------------------------------------- */

export function WatchlistProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [list, setList] = useState<WatchlistMovie[]>([]);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const { user } = useAuth();
  const channelRef = useRef<any>(null);

  /* ---------------------------------------
     INIT WATCHLIST (SAFE FOR EDGE)
  ---------------------------------------- */
  useEffect(() => {
    if (!user) {
      setList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    getWatchlist(user.id).then((items) => {
      setList(items);
      setIsLoading(false);
    });
  }, [user]);

  /* ---------------------------------------
     CROSS-TAB SYNC (EDGE SAFE)
  ---------------------------------------- */
  useEffect(() => {
    if (!user) return;

    let mounted = true;

    (async () => {
      const mod = await import(
        "@/lib/watchlist/watchlist.channel"
      );

      if (!mounted) return;

      channelRef.current = mod.createWatchlistChannel(
        CHANNEL,
        async () => {
          const latest = await getWatchlist(user.id);
          setList(latest);
        }
      );
    })();

    return () => {
      mounted = false;
      channelRef.current?.close?.();
      channelRef.current = null;
    };
  }, [user]);

  /* ---------------------------------------
     BROADCAST CHANGE
  ---------------------------------------- */
  const broadcast = () => {
    channelRef.current?.postMessage?.("updated");
  };

  /* ---------------------------------------
     TOGGLE WATCHLIST
  ---------------------------------------- */
  const toggle = async (movie: WatchlistInput) => {
    if (!user) return;

    const movieId = String(movie.id);
    const existing = list.find(
      (m) => String(m.id) === movieId
    );

    // ❌ REMOVE
    if (existing) {
      await removeFromWatchlist(user.id, movieId);
      setList((prev) =>
        prev.filter((m) => String(m.id) !== movieId)
      );

      broadcast();

      setToast({
        message: "Removed from watchlist",
        undo: async () => {
          await addToWatchlist(existing);
          setList((prev) => [existing, ...prev]);
          broadcast();
        },
      });
    }

    // ✅ ADD
    else {
      const item: WatchlistMovie = {
        ...movie,
        id: movieId,
        userId: user.id,
        addedAt: Date.now(),
      };

      await addToWatchlist(item);
      setList((prev) => [item, ...prev]);

      broadcast();

      setToast({
        message: "Added to watchlist",
        undo: async () => {
          await removeFromWatchlist(user.id, movieId);
          setList((prev) =>
            prev.filter((m) => String(m.id) !== movieId)
          );
          broadcast();
        },
      });
    }

    setTimeout(() => setToast(null), 4000);
  };

  const isSaved = (id: string | number) =>
    list.some((m) => String(m.id) === String(id));

  return (
    <WatchlistContext.Provider
      value={{ list, toggle, isSaved, toast, isLoading }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

/* ---------------------------------------
   HOOK
---------------------------------------- */

export function useWatchlist() {
  const ctx = useContext(WatchlistContext);
  if (!ctx) {
    throw new Error(
      "useWatchlist must be used inside WatchlistProvider"
    );
  }
  return ctx;
}
