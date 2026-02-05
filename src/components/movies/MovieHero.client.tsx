"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import WatchlistButton from "../WatchlistButton";

export default function MovieHero({ movie }: any) {
  const router = useRouter();

  if (!movie) return null;

  return (
    <section className="relative h-[85vh] w-full bg-black text-white overflow-hidden">
      {movie.backdropUrl ? (
        <Image
          src={movie.backdropUrl}
          alt={movie.title || "Movie Backdrop"}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-70"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black opacity-80" />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />

      <div className="relative z-10 h-full flex items-end container mx-auto px-4 sm:px-6 pb-24 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-4 md:space-y-6 max-w-4xl"
        >
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-yellow-400 text-black px-3 py-1 rounded-full font-bold text-sm md:text-base">
              <Star size={16} className="fill-black" />
              {movie.rating?.toFixed(1) || "N/A"}
            </div>
            {movie.runtime > 0 && (
              <span className="text-zinc-300 font-medium text-sm md:text-base">
                {Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m
              </span>
            )}
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-7xl font-extrabold leading-tight tracking-tight">
            {movie.title}
          </h1>

          <p className="text-sm sm:text-lg text-zinc-300 max-w-2xl line-clamp-3 md:line-clamp-none">
            {movie.overview}
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2 sm:pt-4 w-full sm:w-auto">
            <button
              onClick={() => {
                if (movie.trailerKey) {
                  router.push(`?play=true`);
                } else {
                  alert("No trailer available for this movie.");
                }
              }}
              className={`bg-yellow-500 text-black px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-base sm:text-lg flex items-center justify-center gap-3 transition-all transform ${movie.trailerKey
                  ? "hover:bg-yellow-400 hover:scale-105 cursor-pointer"
                  : "opacity-50 cursor-not-allowed hover:none"
                }`}
            >
              <Play size={20} className="fill-black" aria-hidden="true" />
              Watch Trailer
            </button>

            <WatchlistButton
              movie={{
                id: movie.id,
                title: movie.title,
                posterUrl: movie.posterUrl,
                releaseYear: movie.releaseYear,
                rating: movie.rating,
              }}
              label="Add to Watchlist"
              className="px-6 py-3 sm:px-8 sm:py-4 rounded-xl font-bold text-base sm:text-lg backdrop-blur-md bg-white/10 hover:bg-white/20 ring-1 ring-white/30 text-center justify-center"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
