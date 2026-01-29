"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Star, X, Heart } from "lucide-react";
import { useState } from "react";

import type { Movie } from "@/data/movies/movie.types";
import { useWatchlist } from "@/lib/watchlist.context";

type Props = {
  movie: Movie;
};

export default function MovieHero({ movie }: Props) {
  const [open, setOpen] = useState(false);

  const { toggle, isSaved } = useWatchlist();
  const saved = isSaved(movie.id);

  return (
    <section className="relative h-[85vh] w-full overflow-hidden bg-black text-white">
      {movie.backdropUrl && (
        <Image
          src={movie.backdropUrl}
          alt={movie.title}
          fill
          priority
          className="object-cover opacity-70"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-7xl items-end px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex gap-10 rounded-3xl bg-white/10 p-10 backdrop-blur-xl"
        >
          {movie.posterUrl && (
            <div className="hidden w-[260px] overflow-hidden rounded-2xl sm:block">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                width={260}
                height={390}
              />
            </div>
          )}

          <div className="max-w-xl space-y-5">
            {typeof movie.rating === "number" && (
              <div className="inline-flex items-center gap-2 rounded-full bg-yellow-400 px-4 py-1 text-sm font-semibold text-black">
                <Star size={14} />
                {movie.rating.toFixed(1)}
              </div>
            )}

            <h1 className="text-5xl font-extrabold">
              {movie.title}
            </h1>

            <p className="text-sm opacity-80">
              {movie.releaseYear} • {movie.runtime} min
            </p>

            <p className="text-sm opacity-80 leading-relaxed">
              {movie.overview}
            </p>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-3 font-semibold text-black"
              >
                <Play size={18} />
                Watch Trailer
              </button>

              <button
                onClick={() =>
                  toggle({
                    id: movie.id,
                    title: movie.title,
                    posterUrl: movie.posterUrl!,
                    releaseYear: movie.releaseYear ?? 0,
                    rating: movie.rating ?? 0,
                  })
                }
                className="flex items-center gap-2 rounded-lg bg-white/10 px-6 py-3"
              >
                <Heart
                  className={
                    saved
                      ? "fill-red-500 text-red-500"
                      : ""
                  }
                />
                {saved ? "Saved" : "Watchlist"}
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative aspect-video w-full max-w-5xl bg-black"
            >
              <button
                onClick={() => setOpen(false)}
                className="absolute right-4 top-4 z-10 rounded-full bg-black/70 p-2"
              >
                <X />
              </button>

              <iframe
                className="h-full w-full"
                src="https://www.youtube.com/embed/mqqft2x_Aa4?autoplay=1"
                allow="autoplay; encrypted-media"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
