"use client";

import { Play, Star, Calendar, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getMovieTrailers } from "@/lib/tmdb/tmdb.service";
import TrailerPlayer from "./movies/TrailerPlayer";

interface HeroProps {
  movies?: Array<{
    id: number;
    title: string;
    description?: string;
    image: string;
    backdropUrl?: string;
    rating: number;
  }>;
}

export default function Hero({ movies = [] }: HeroProps) {
  const [currentMovie, setCurrentMovie] = useState(0);
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [isLoadingTrailer, setIsLoadingTrailer] = useState(false);

  // Use movies prop or fallback if empty (though logic suggests it shouldn't be empty if passed correctly)
  const heroMovies = movies.length > 0 ? movies : [];

  useEffect(() => {
    if (heroMovies.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentMovie((p) => (p + 1) % heroMovies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [heroMovies.length]);

  if (heroMovies.length === 0) return null; // Or some skeleton

  const movie = heroMovies[currentMovie];

  const handleWatchTrailer = async () => {
    if (isLoadingTrailer) return;
    setIsLoadingTrailer(true);
    try {
      const trailers = await getMovieTrailers(movie.id);
      if (trailers.length > 0) {
        // Extract ID from youtube URL safely
        try {
          const url = new URL(trailers[0]);
          const videoId = url.searchParams.get("v");
          if (videoId) {
            setTrailerKey(videoId);
          } else {
            console.warn("Could not extract video ID from URL:", trailers[0]);
          }
        } catch (e) {
          console.error("Invalid URL:", trailers[0]);
        }
      } else {
        // Optional: Show toast "No trailer available"
        console.warn("No trailer found");
      }
    } catch (error) {
      console.error("Failed to load trailer", error);
    } finally {
      setIsLoadingTrailer(false);
    }
  };

  return (
    <div className="relative h-[90vh]">
      {trailerKey && (
        <TrailerPlayer
          videoKey={trailerKey}
          initialPlay={true}
          onClose={() => setTrailerKey(null)}
        />
      )}

      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000"
        style={{ backgroundImage: `url(${movie.backdropUrl || movie.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            {movie.title}
          </h1>

          <div className="flex items-center gap-3 mb-4 text-yellow-400">
            <Star className="fill-current w-5 h-5" />
            <span className="text-xl font-bold">{movie.rating.toFixed(1)}</span>
          </div>

          <p className="mb-6 text-white/90 text-lg line-clamp-3 drop-shadow-md">
            {movie.description}
          </p>

          <div className="flex gap-4">
            <button
              onClick={handleWatchTrailer}
              disabled={isLoadingTrailer}
              className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoadingTrailer ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
              Watch Trailer
            </button>

            <Link
              href={`/movies/${movie.id}`}
              className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-xl hover:bg-white/20 transition-colors font-medium"
            >
              More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
