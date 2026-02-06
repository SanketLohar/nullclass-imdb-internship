import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { tmdbService } from "@/lib/tmdb/tmdb.service";
import MovieCard from "@/components/MovieCard";
import OfflineBoundary from "@/components/system/OfflineBoundary";

export default async function ComingSoonPage() {
  // Fetch upcoming movies from TMDb using centralized logic
  const { getComingSoonMovies } = await import("@/lib/tmdb/tmdb.service");
  const movies = await getComingSoonMovies();

  return (
    <OfflineBoundary>
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold mb-8">Coming Soon</h1>

        {movies.length === 0 ? (
          <p className="text-zinc-400">
            No upcoming movies available at the moment.
          </p>
        ) : (
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
                    image={movie.posterUrl}
                    posterUrl={movie.posterUrl}
                    year={movie.releaseYear}
                    genre={[]} // No genre data available for coming soon listing
                  />
                </Link>
              ))}
            </div>
          </Suspense>
        )}
      </div>
    </OfflineBoundary>
  );
}
