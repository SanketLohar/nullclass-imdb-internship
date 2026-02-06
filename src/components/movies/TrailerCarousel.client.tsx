"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";

type Props = {
  trailers: string[];
  images: string[];
};

export default function TrailerCarousel({
  trailers,
  images,
}: Props) {
  // Process trailers - handle both video IDs and full YouTube URLs
  const processedTrailers = trailers
    .filter((t) => t && t.trim().length > 0)
    .map((t) => {
      let videoId = "";
      const trimmed = t.trim();

      if (!trimmed.includes("youtube.com") && !trimmed.includes("youtu.be")) {
        videoId = trimmed;
      } else if (trimmed.includes("youtube.com/watch?v=")) {
        videoId = trimmed.split("watch?v=")[1]?.split("&")[0] || "";
      } else if (trimmed.includes("youtu.be/")) {
        videoId = trimmed.split("youtu.be/")[1]?.split("?")[0] || "";
      } else if (trimmed.includes("youtube.com/embed/")) {
        videoId = trimmed.split("embed/")[1]?.split("?")[0] || "";
      } else {
        videoId = trimmed;
      }

      return { type: "trailer" as const, src: videoId };
    });

  const items = [
    ...processedTrailers,
    ...images.map((i) => ({ type: "image" as const, src: i })),
  ];

  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") {
        prev();
      } else if (e.key === "ArrowRight") {
        next();
      }
    }

    const container = containerRef.current;
    if (container) {
      container.addEventListener("keydown", handleKeyDown);
      container.setAttribute("tabIndex", "0");
      return () => container.removeEventListener("keydown", handleKeyDown);
    }
  }, [items.length]);

  if (items.length === 0) return null;

  const current = items[index];

  function next() {
    setIndex((i) => (i + 1) % items.length);
  }

  function prev() {
    setIndex((i) => (i - 1 + items.length) % items.length);
  }

  const [isPlaying, setIsPlaying] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Reset states when slide changes
  useEffect(() => {
    setIsPlaying(false);
    setImgError(false);
  }, [index]);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-7xl mx-auto aspect-[16/9] md:aspect-[2.4/1] rounded-xl overflow-hidden bg-card-bg/50 mb-10 group focus:outline-none focus:ring-2 focus:ring-accent shadow-2xl border border-border/50"
      tabIndex={0}
      role="region"
      aria-label="Movie trailers and images carousel"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.35 }}
          className={`absolute inset-0 ${isPlaying ? "z-50" : "z-0"}`}
        >
          {current.type === "image" ? (
            <Image
              src={current.src}
              alt="Movie backdrop"
              fill
              className="object-cover"
              sizes="100vw"
              quality={90}
              priority={index === 0}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ) : (
            isPlaying ? (
              <div className="relative w-full h-full group/video">
                <button
                  onClick={() => setIsPlaying(false)}
                  className="absolute top-3 right-3 z-[60] p-2.5 bg-black/60 hover:bg-red-600/80 rounded-full text-white backdrop-blur-md transition-all border border-white/10 shadow-lg active:scale-95"
                  style={{ pointerEvents: "auto" }}
                  aria-label="Close trailer"
                >
                  <X className="w-5 h-5" />
                </button>

                <iframe
                  src={`https://www.youtube.com/embed/${current.src}?autoplay=1&mute=1&controls=1&playsinline=1&rel=0&enablejsapi=1&widget_referrer=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  className="w-full h-full min-w-[300px] min-h-[200px]"
                  width="100%"
                  height="100%"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
                  allowFullScreen
                  frameBorder="0"
                  title="Movie trailer"
                  loading="lazy"
                />
              </div>
            ) : (
              <button
                type="button"
                className="relative w-full h-full cursor-pointer group/play bg-zinc-900 appearance-none border-0 p-0 m-0 block text-left"
                onClick={() => setIsPlaying(true)}
                aria-label="Play trailer"
              >
                {!imgError ? (
                  <Image
                    src={`https://img.youtube.com/vi/${current.src}/maxresdefault.jpg`}
                    alt="Trailer thumbnail"
                    fill
                    className="object-cover opacity-80 group-hover/play:opacity-60 transition-opacity"
                    onError={() => setImgError(true)}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                    <span className="text-zinc-500 text-sm">Preview Unavailable</span>
                  </div>
                )}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-yellow-500 rounded-full flex items-center justify-center pl-1 shadow-lg transform group-hover/play:scale-110 transition-transform">
                    <Play className="w-8 h-8 text-black fill-black" />
                  </div>
                </div>
              </button>
            )
          )}
        </motion.div>
      </AnimatePresence>

      {
        items.length > 1 && (
          <>
            <button
              onClick={prev}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  prev();
                }
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 px-4 py-2 rounded-full text-white transition-opacity opacity-0 group-hover:opacity-100 z-10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>

            <button
              onClick={next}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  next();
                }
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/70 hover:bg-black/90 px-4 py-2 rounded-full text-white transition-opacity opacity-0 group-hover:opacity-100 z-10 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              aria-label="Next slide"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Dots indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {items.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setIndex(i)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setIndex(i);
                    }
                  }}
                  className={`w-2 h-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-yellow-500 ${i === index ? "bg-yellow-500 w-6" : "bg-white/50 hover:bg-white/70"
                    }`}
                  aria-label={`Go to slide ${i + 1}`}
                  aria-current={i === index ? "true" : "false"}
                />
              ))}
            </div>
          </>
        )
      }
    </div >
  );
}
