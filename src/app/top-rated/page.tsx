import { Suspense } from "react";

import { MOVIES } from "@/data/movies";

import Link from "next/link";
import Image from "next/image";
import MovieCard from "@/components/MovieCard";

export default async function TopRatedPage() {
  // Fetch from TMDb
  const { tmdbService } = await import("@/lib/tmdb/tmdb.service");
  const responses = await Promise.all([
    tmdbService.getTopRatedMovies(1),
    tmdbService.getTopRatedMovies(2),
    tmdbService.getTopRatedMovies(3),
  ]);
  const config = await tmdbService.getConfig();

  const allMovies = responses.flatMap(r => r.results);
  const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

  const movies = uniqueMovies
    .filter(m => m.poster_path && m.release_date && m.vote_count > 100)
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
              className="block h-full"
            >
              <MovieCard
                id={movie.id}
                title={movie.title}
                rating={movie.rating}
                image={movie.posterUrl} // Use poster as main image for card
                posterUrl={movie.posterUrl}
                year={movie.releaseYear}
                genre={movie.genres}
              />
            </Link>
          ))}
        </div>
      </Suspense>
    </div>
  );
}
