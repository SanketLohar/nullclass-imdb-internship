"use client";

import { Bookmark, Check } from "lucide-react";
import { useWatchlist } from "@/context/watchlist.context";
import { useAuth } from "@/context/auth/auth.context";
import { useRouter } from "next/navigation";

interface Props {
  movie: {
    id: string;
    title: string;
    posterUrl: string;
    releaseYear: number;
    rating?: number;
  };
}

import { motion, AnimatePresence } from "framer-motion";

export default function WatchlistToggle({ movie }: Props) {
  const { toggle, isSaved } = useWatchlist();
  const { user } = useAuth();
  const router = useRouter();

  const saved = isSaved(movie.id);

  const onClick = () => {
    if (!user) {
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }

    toggle({
      id: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      releaseYear: movie.releaseYear,
      rating: movie.rating,
    });
  };

  return (
    <>
      <motion.button
        onClick={onClick}
        whileTap={{ scale: 0.9 }}
        initial={false}
        animate={{
          backgroundColor: saved ? "#ef4444" : "#27272a",
          color: "#ffffff"
        }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-colors hover:bg-zinc-700`}
        aria-label={saved ? "Remove from Watchlist" : "Add to Watchlist"}
        aria-pressed={saved}
      >
        <AnimatePresence mode="wait">
          {saved ? (
            <motion.span
              key="check"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Check className="w-4 h-4" />
            </motion.span>
          ) : (
            <motion.span
              key="bookmark"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Bookmark className="w-4 h-4" />
            </motion.span>
          )}
        </AnimatePresence>
        <span>{saved ? "In Watchlist" : "Add to Watchlist"}</span>
      </motion.button>

      {/* Accessible Status Announcement */}
      <div className="sr-only" aria-live="polite">
        {saved ? `${movie.title} added to watchlist` : ""}
      </div>
    </>
  );
}
