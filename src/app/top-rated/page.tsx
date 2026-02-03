import { Suspense } from "react";

import { MOVIES } from "@/data/movies";

import Link from "next/link";
import Image from "next/image";

export default async function TopRatedPage() {
  let movies = MOVIES.slice(0, 20).sort((a, b) => b.rating - a.rating);

  // Try to fetch from TMDb if API key is available
  if (process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    try {
      const { tmdbService } = await import("@/lib/tmdb/tmdb.service");
      const response = await tmdbService.getTopRatedMovies(1);
      const config = await tmdbService.getConfig();

      movies = (response?.results || [])
        .filter(m => m.poster_path && m.release_date)
        .slice(0, 20)
        .map(movie => ({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          releaseYear: new Date(movie.release_date).getFullYear(),
          rating: movie.vote_average,
          posterUrl: movie.poster_path
            ? `${config.images.secure_base_url}w500${movie.poster_path}`
            : "/placeholder-movie.jpg",
          backdropUrl: movie.backdrop_path
            ? `${config.images.secure_base_url}w1280${movie.backdrop_path}`
            : "/placeholder-backdrop.jpg",
          runtime: 0,
          cast: [],
          genres: [],
        }));
    } catch (error) {
      console.error("Failed to fetch top rated from TMDb:", error);
      // Fallback to mock data
    }
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-8">Top Rated Movies</h1>

      <Suspense
        fallback={
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="h-96 bg-zinc-900/60 rounded-lg animate-pulse" />
            ))}
          </div>
        }
      >
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="group"
            >
              <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                <Image
                  src={movie.posterUrl}
                  alt={movie.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform"
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                  loading="lazy"
                />
              </div>
              <h3 className="font-semibold text-sm mb-1 group-hover:text-yellow-400 transition-colors">
                {movie.title}
              </h3>
              <p className="text-xs text-zinc-400">
                ⭐ {movie.rating.toFixed(1)}
              </p>
            </Link>
          ))}
        </div>
      </Suspense>
    </div>
  );
}
