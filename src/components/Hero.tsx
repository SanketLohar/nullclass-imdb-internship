"use client";

import { Play, Star, Calendar } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const featuredMovies = [
  {
    id: 1,
    title: "Dune: Part Two",
    rating: 8.8,
    releaseDate: "March 1, 2024",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge.",
    image:
      "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=2000&q=80",
  },
  {
    id: 2,
    title: "Oppenheimer",
    rating: 8.9,
    releaseDate: "July 21, 2023",
    description:
      "The story of J. Robert Oppenheimer and the atomic bomb.",
    image:
      "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=2000&q=80",
  },
];

export default function Hero() {
  const [currentMovie, setCurrentMovie] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentMovie((p) => (p + 1) % featuredMovies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const movie = featuredMovies[currentMovie];

  return (
    <div className="relative h-[90vh]">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${movie.image})` }}
      />

      <div className="relative z-10 container mx-auto px-4 h-full flex items-center">
        <div className="max-w-2xl text-white">
          <h1 className="text-6xl font-bold mb-4">
            {movie.title}
          </h1>

          <p className="mb-6 text-zinc-300">
            {movie.description}
          </p>

          <div className="flex gap-4">
            <Link
              href={`/movies/${movie.id}`}
              className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold"
            >
              <Play className="inline mr-2" />
              Watch Trailer
            </Link>

            <Link
              href={`/movies/${movie.id}`}
              className="bg-zinc-800 px-6 py-3 rounded-xl"
            >
              More Info
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
