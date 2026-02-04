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
  isSaved: (id: string) => boolean;
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

  const channelRef = useRef<BroadcastChannel | null>(null);

  /* ---------------------------------------
     INIT + SYNC LISTENER
  ---------------------------------------- */
  useEffect(() => {
    if (!user) {
      setList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    // initial load
    getWatchlist(user.id).then((items) => {
      setList(items);
      setIsLoading(false);
    });

    // cross-tab channel
    const channel = new BroadcastChannel(CHANNEL);
    channelRef.current = channel;

    channel.onmessage = async () => {
      if (user) {
        const latest = await getWatchlist(user.id);
        setList(latest);
      }
    };

    return () => channel.close();
  }, [user]);

  /* ---------------------------------------
     BROADCAST CHANGE
  ---------------------------------------- */
  const broadcast = () => {
    channelRef.current?.postMessage("updated");
  };

  /* ---------------------------------------
     TOGGLE WATCHLIST
  ---------------------------------------- */
  const toggle = async (movie: WatchlistInput) => {
    if (!user) return; // Should be handled by UI, but safe guard

    const movieId = String(movie.id);
    const existing = list.find(
      (m: WatchlistMovie) => String(m.id) === movieId
    );

    // ❌ REMOVE
    if (existing) {
      await removeFromWatchlist(user.id, movieId);
      setList((prev: WatchlistMovie[]) =>
        prev.filter((m: WatchlistMovie) => String(m.id) !== movieId)
      );

      broadcast();

      setToast({
        message: "Removed from watchlist",
        undo: async () => {
          if (!user) return;
          await addToWatchlist(existing);
          setList((prev: WatchlistMovie[]) => [
            existing,
            ...prev,
          ]);
          broadcast();
        },
      });
    }

    // ✅ ADD
    else {
      const item: WatchlistMovie = {
        ...movie,
        id: movieId, // Ensure ID is stored as string
        userId: user.id,
        addedAt: Date.now(),
      };

      await addToWatchlist(item);
      setList((prev: WatchlistMovie[]) => [item, ...prev]);

      broadcast();

      setToast({
        message: "Added to watchlist",
        undo: async () => {
          if (!user) return;
          await removeFromWatchlist(user.id, movieId);
          setList((prev: WatchlistMovie[]) =>
            prev.filter(
              (m: WatchlistMovie) => String(m.id) !== movieId
            )
          );
          broadcast();
        },
      });
    }

    // auto-hide toast
    setTimeout(() => setToast(null), 4000);
  };

  const isSaved = (id: string | number) =>
    list.some((m: WatchlistMovie) => String(m.id) === String(id));

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
