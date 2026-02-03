import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { tmdbService } from "@/lib/tmdb/tmdb.service";

export default async function ComingSoonPage() {
  let movies: Array<{
    id: number;
    title: string;
    posterUrl: string;
    rating: number;
    releaseYear: number;
  }> = [];

  // Fetch upcoming movies from TMDb using centralized logic
  if (process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    const { getComingSoonMovies } = await import("@/lib/tmdb/tmdb.service");
    movies = await getComingSoonMovies();
  }

  return (
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
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2">
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform"
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    quality={90}
                    loading="lazy"
                  />
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-yellow-400 transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-zinc-400">
                  {movie.releaseYear} • ⭐ {movie.rating.toFixed(1)}
                </p>
              </Link>
            ))}
          </div>
        </Suspense>
      )}
    </div>
  );
}
