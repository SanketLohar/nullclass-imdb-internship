"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import Link from "next/link";
import MovieCard from "./MovieCard";

type Movie = {
  id: number;
  title: string;
  rating: number;
  image: string;
  posterUrl?: string;
  year: number;
  genre: string[];
};

export default function MovieCarousel({
  movies,
}: {
  movies: Movie[];
}) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = scrollContainerRef.current.clientWidth * 0.75;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative group">
      {/* Scroll Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 text-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 shadow-lg"
        aria-label="Scroll left"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 text-foreground p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 shadow-lg"
        aria-label="Scroll right"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Carousel Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-4 overflow-x-auto scrollbar-hide snap-x snap-mandatory py-4 px-1"
        style={{ scrollBehavior: "smooth" }}
      >
        {movies.map((movie) => (
          <div
            key={movie.id}
            className="flex-none w-[160px] sm:w-[200px] md:w-[240px] snap-start"
          >
            <Link href={`/movies/${movie.id}`} className="block h-full">
              <MovieCard {...movie} />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
