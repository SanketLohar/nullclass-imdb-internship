"use client";

import Link from "next/link";
import { useWatchlist } from "@/context/watchlist.context";
import MovieCard from "@/components/MovieCard";

export default function WatchlistClient() {
  const { list, isLoading } = useWatchlist();

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Loading watchlist...
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">
        Your watchlist is empty 🎬
      </div>
    );
  }

  return (
    <section className="px-6 py-10">
      <h1 className="mb-6 text-3xl font-bold text-foreground">
        My Watchlist
      </h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 sm:gap-6">
        {list.map((movie) => (
          <Link key={movie.id} href={`/movies/${movie.id}`} className="block h-full transition-transform hover:scale-105">
            <MovieCard
              id={Number(movie.id)}
              title={movie.title}
              image={movie.posterUrl}
              rating={movie.rating ?? 0}
              year={movie.releaseYear}
              genre={[]}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}
