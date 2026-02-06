"use client";

import Image from "next/image";
import { Play } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Movie } from "@/data/movie.types";
import WatchlistToggle from "@/components/watchlist/WatchlistToggle.client";

type Props = {
  movie: Movie;
};
// Accessibility Note:
// The Next.js <Image> component "alt" property should always be a meaningful, descriptive string or, when purely decorative, an empty string ("").
// If movie.title is unavailable or empty, fallback to a generic but helpful alt text.

function getBackdropAlt(movie: Movie | null | undefined): string {
  if (!movie) {
    return "Movie backdrop image";
  }
  if (typeof movie.title === "string" && movie.title.trim().length > 0) {
    return `Backdrop image for ${movie.title}`;
  }
  return "Movie backdrop image";
}
// The error message indicates that the <Image> component is missing a valid "alt" property or it may be using an insufficient "alt" value (e.g., sometimes "movie.title" can be empty or undefined).
// The helper function getBackdropAlt(movie) is already defined above for this purpose.
// You should update usages of <Image> in MovieHeroShell to use getBackdropAlt(movie) for the alt prop instead of just movie.title.
//
// If you don't have access to the exact line inside the component, ensure the helper is available for use at the point of rendering <Image>.



export default function MovieHeroShell({
  movie,
}: Props) {
  const [showTrailer, setShowTrailer] = useState(false);

  // Get trailer URL - try movie.trailer first, fallback to YouTube
  const trailerUrl = movie.trailer || "";

  // Debug: Log trailer URL (remove in production)
  if (typeof window !== "undefined" && trailerUrl) {
    console.log("Trailer URL:", trailerUrl);
  }

  return (
    <>
      <section className="relative h-[70vh] w-full bg-black text-white overflow-hidden">
        {movie?.backdropUrl && (
          <Image
            src={movie.backdropUrl}
            alt={getBackdropAlt(movie) || "Movie backdrop image"}
            fill
            priority
            quality={90}
            className="object-cover object-center opacity-40"
            sizes="100vw"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-6 pb-16">
          <div className="w-full">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {movie.title}
            </h1>

            <div className="flex flex-wrap gap-4 mb-6 text-sm text-zinc-300">
              {movie.releaseYear && (
                <span>📅 {movie.releaseYear}</span>
              )}
              {movie.rating && (
                <span>⭐ {movie.rating.toFixed(1)}</span>
              )}
              {movie.runtime && (
                <span>⏱ {movie.runtime} min</span>
              )}
            </div>

            {movie.overview && (
              <p className="text-zinc-300 max-w-2xl mb-6 leading-relaxed">
                {movie.overview}
              </p>
            )}

            <div className="flex flex-wrap gap-4">
              {trailerUrl && (
                <motion.button
                  onClick={() => setShowTrailer(true)}
                  className="flex items-center gap-2 bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Play className="w-5 h-5" fill="currentColor" />
                  Watch Trailer
                </motion.button>
              )}

              {movie.posterUrl && (
                <WatchlistToggle
                  movie={{
                    id: String(movie.id),
                    title: movie.title,
                    posterUrl: movie.posterUrl,
                    releaseYear: movie.releaseYear || 0,
                    rating: movie.rating,
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailerUrl && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="trailer-title"
            onClick={(e) => {
              // Only close if clicking the backdrop area, not the content
              if (e.target === e.currentTarget) {
                setShowTrailer(false);
              }
            }}
          >
            {/* Backdrop visual */}
            <div
              className="fixed inset-0 bg-black/95 -z-10"
              aria-hidden="true"
            />

            <motion.div
              className="relative w-full max-w-5xl aspect-video mx-4"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute -top-12 right-0 text-white hover:text-yellow-400 transition-colors z-30"
                aria-label="Close trailer"
              >
                <span className="text-2xl">×</span>
              </button>
              {(() => {
                let embedUrl = "";
                let videoId = "";

                // Extract video ID from various YouTube URL formats
                if (trailerUrl.includes("youtube.com/watch?v=")) {
                  videoId = trailerUrl.split("watch?v=")[1]?.split("&")[0] || "";
                } else if (trailerUrl.includes("youtu.be/")) {
                  videoId = trailerUrl.split("youtu.be/")[1]?.split("?")[0] || "";
                } else if (trailerUrl.includes("youtube.com/embed/")) {
                  videoId = trailerUrl.split("embed/")[1]?.split("?")[0] || "";
                }

                if (videoId) {
                  embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=1&playsinline=1&rel=0&enablejsapi=1&widget_referrer=${typeof window !== 'undefined' ? window.location.origin : ''}`;
                } else {
                  // Fallback - try to use URL as-is
                  embedUrl = trailerUrl;
                }

                return (
                  <iframe
                    src={embedUrl}
                    className="w-full h-full rounded-lg min-w-[300px] min-h-[200px]"
                    width="100%"
                    height="100%"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                    allowFullScreen
                    frameBorder="0"
                    title={`${movie.title} Trailer`}
                    loading="lazy"
                  />
                );
              })()}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
