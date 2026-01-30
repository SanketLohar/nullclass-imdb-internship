"use client";

import { Heart, Star } from "lucide-react";
import { motion } from "framer-motion";
import { useWatchlist } from "@/_wip/watchlist.context";

export type MovieCardProps = {
  id: string;
  title: string;
  posterUrl: string;
  rating: number;
  year: number;
  genre: string[];
};

export default function MovieCard({
  id,
  title,
  posterUrl,
  rating,
  year,
  genre,
}: MovieCardProps) {
  const { toggle, isSaved } = useWatchlist();
  const saved = isSaved(id);

  return (
    <motion.div
      whileHover={{ scale: 1.04 }}
      className="group rounded-xl overflow-hidden bg-zinc-900/60 backdrop-blur-sm relative"
    >
      {/* ❤️ HEART */}
      <button
        onClick={() =>
          toggle({
            id,
            title,
            posterUrl,
            releaseYear: year,
            rating,
          })
        }
        className="absolute z-20 top-3 left-3 bg-black/70 p-2 rounded-full hover:scale-110 transition"
      >
        <Heart
          className={`w-5 h-5 transition ${
            saved
              ? "fill-red-500 text-red-500"
              : "text-white"
          }`}
        />
      </button>

      {/* IMAGE */}
      <div className="relative aspect-[2/3]">
        <img
          src={posterUrl}
          alt={title}
          className="h-full w-full object-cover"
        />

        {/* ⭐ RATING */}
        <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-md flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
          <span className="text-yellow-400 text-sm font-semibold">
            {rating.toFixed(1)}
          </span>
        </div>
      </div>

      {/* INFO */}
      <div className="p-4">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-semibold truncate">
            {title}
          </h3>
          <span className="text-xs text-zinc-400">
            {year}
          </span>
        </div>

        {genre.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {genre.slice(0, 2).map((g) => (
              <span
                key={g}
                className="text-xs bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-300"
              >
                {g}
              </span>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}
