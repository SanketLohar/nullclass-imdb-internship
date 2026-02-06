import { Suspense } from "react";
import Hero from "@/components/Hero";
import MovieCarousel from "@/components/MovieCarousel";
import { tmdbService } from "@/lib/tmdb/tmdb.service";
import { Award, Clock, Star, TrendingUp } from "lucide-react";
import Link from "next/link";
import OfflineBoundary from "@/components/system/OfflineBoundary";

// Edge Runtime: Safe because this uses only fetch-based TMDB service (Request coalescing is memory-safe or ignored on Edge)
export const runtime = "edge";

async function getMovies() {
  const [trending, upcomingMovies, config] = await Promise.all([
    tmdbService.getPopularMovies(),
    tmdbService.getComingSoonMovies(),
    tmdbService.getConfig(),
  ]);

  const mapMovie = (movie: any) => ({
    id: movie.id,
    title: movie.title,
    rating: movie.vote_average,
    image: movie.backdrop_path
      ? `${config.images.secure_base_url}w1280${movie.backdrop_path}`
      : `${config.images.secure_base_url}w1280${movie.poster_path}`, // Fallback for components still using 'image'
    posterUrl: movie.poster_path
      ? `${config.images.secure_base_url}w780${movie.poster_path}`
      : `${config.images.secure_base_url}w780${movie.backdrop_path}`,
    backdropUrl: movie.backdrop_path
      ? `${config.images.secure_base_url}original${movie.backdrop_path}`
      : "/placeholder-backdrop.jpg",
    year: new Date(movie.release_date).getFullYear(),
    genre: [],
  });

  // Map basic details first
  const mappedTrending = trending.results.map(mapMovie);
  const mappedUpcoming = upcomingMovies.map(mapMovie);

  // Enhance the #1 Trending Movie with a better backdrop (if available)
  if (mappedTrending.length > 0) {
    try {
      const topMovieId = mappedTrending[0].id;
      const images = await tmdbService.getMovieImages(topMovieId);

      // Try to find a different backdrop than the default one to give variety
      // We pick the 2nd highly rated one, or just the 2nd one in the list
      if (images && images.backdrops && images.backdrops.length > 1) {
        // User rejected index 1 and 2. Trying index 3.
        const betterBackdrop = images.backdrops[3];
        if (betterBackdrop) {
          mappedTrending[0].backdropUrl = `${config.images.secure_base_url}original${betterBackdrop.file_path}`;
          // Also update 'image' property used by Hero
          mappedTrending[0].image = `${config.images.secure_base_url}original${betterBackdrop.file_path}`;
        }
      }
    } catch (e) {
      console.warn("Failed to fetch alternative hero image", e);
    }
  }

  return {
    trendingMovies: mappedTrending,
    upcomingMovies: mappedUpcoming,
  };
}

export default async function HomePage() {
  const { trendingMovies, upcomingMovies } = await getMovies();

  return (
    <OfflineBoundary>
      <div>
        <Hero movies={trendingMovies.slice(0, 5)} />

        <main className="container mx-auto px-4 py-8">
          {/* Quick categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {[
              {
                icon: TrendingUp,
                label: "Trending",
                path: "/movies?sort=trending",
                color: "bg-yellow-400 text-black", // Black on Yellow is accessible
              },
              {
                icon: Star,
                label: "Top Rated",
                path: "/top-rated",
                color: "bg-purple-600 text-white", // Increased from 500
              },
              {
                icon: Clock,
                label: "Coming Soon",
                path: "/coming-soon",
                color: "bg-blue-600 text-white", // Increased from 500
              },
              {
                icon: Award,
                label: "Awards",
                path: "/awards",
                color: "bg-red-600 text-white", // Increased from 500
              },
            ].map((category, index) => (
              <Link
                key={index}
                href={category.path}
                className={`${category.color} p-4 rounded-xl flex items-center justify-center gap-2 hover:opacity-80 transition-opacity`}
              >
                <category.icon className="w-5 h-5" aria-hidden="true" />
                <span className="font-medium">
                  {category.label}
                </span>
              </Link>
            ))}
          </div>

          {/* Trending */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-yellow-700" aria-hidden="true" />
                Trending Now
              </h2>

              <Link
                href="/movies?sort=trending"
                className="text-yellow-700 hover:text-yellow-600"
              >
                View All
              </Link>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
              <MovieCarousel movies={trendingMovies} />
            </Suspense>
          </section>

          {/* Coming soon */}
          <section className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Clock className="w-6 h-6 text-yellow-700" aria-hidden="true" />
                Coming Soon
              </h2>

              <Link
                href="/coming-soon"
                className="text-yellow-700 hover:text-yellow-600"
              >
                View All
              </Link>
            </div>

            <Suspense fallback={<div>Loading...</div>}>
              <MovieCarousel movies={upcomingMovies} />
            </Suspense>
          </section>
        </main>
      </div>
    </OfflineBoundary>
  );
}
