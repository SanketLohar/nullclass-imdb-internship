"use client";

import { useWatchlist } from "@/lib/watchlist.context";
import MovieCard from "@/components/movies/MovieCard.client";

export default function WatchlistClient() {
  const { list } = useWatchlist();

  if (list.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-zinc-400">
        Your watchlist is empty 🎬
      </div>
    );
  }

  return (
    <section className="px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-white">
        My Watchlist
      </h1>

      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {list.map((movie) => (
          <MovieCard
            key={movie.id}
            id={movie.id}                 // ✅ REQUIRED
            title={movie.title}
            posterUrl={movie.posterUrl}
            rating={movie.rating ?? 0}
            year={movie.releaseYear}
            genre={[]}                   // (can improve later)
          />
        ))}
      </div>
    </section>
  );
}
