"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

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

  const channelRef = useRef<BroadcastChannel | null>(null);

  /* ---------------------------------------
     INIT + SYNC LISTENER
  ---------------------------------------- */
  useEffect(() => {
    // initial load
    getWatchlist().then(setList);

    // cross-tab channel
    const channel = new BroadcastChannel(CHANNEL);
    channelRef.current = channel;

    channel.onmessage = async () => {
      const latest = await getWatchlist();
      setList(latest);
    };

    return () => channel.close();
  }, []);

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
    const existing = list.find(
      (m) => m.id === movie.id
    );

    // ❌ REMOVE
    if (existing) {
      await removeFromWatchlist(movie.id);
      setList((prev) =>
        prev.filter((m) => m.id !== movie.id)
      );

      broadcast();

      setToast({
        message: "Removed from watchlist",
        undo: async () => {
          await addToWatchlist(existing);
          setList((prev) => [
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
        addedAt: Date.now(),
      };

      await addToWatchlist(item);
      setList((prev) => [item, ...prev]);

      broadcast();

      setToast({
        message: "Added to watchlist",
        undo: async () => {
          await removeFromWatchlist(item.id);
          setList((prev) =>
            prev.filter(
              (m) => m.id !== item.id
            )
          );
          broadcast();
        },
      });
    }

    // auto-hide toast
    setTimeout(() => setToast(null), 4000);
  };

  const isSaved = (id: string) =>
    list.some((m) => m.id === id);

  return (
    <WatchlistContext.Provider
      value={{ list, toggle, isSaved, toast }}
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
