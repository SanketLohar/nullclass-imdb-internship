"use client";

import { SlidersHorizontal, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

type Movie = {
  id: number;
  title: string;
  rating: number;
  image: string;
  year: number;
  genre: string[];
};

export default function MoviesPage() {
  const searchParams = useSearchParams();
  const search = searchParams.get("search");

  const movies: Movie[] = [
    {
      id: 1,
      title: "Dune: Part Two",
      rating: 8.8,
      image:
        "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=800&q=80",
      year: 2024,
      genre: ["Action", "Adventure", "Sci-Fi"],
    },
    {
      id: 2,
      title: "Poor Things",
      rating: 8.4,
      image:
        "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
      year: 2023,
      genre: ["Comedy", "Drama", "Romance"],
    },
    {
      id: 3,
      title: "Oppenheimer",
      rating: 8.9,
      image:
        "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
      year: 2023,
      genre: ["Biography", "Drama", "History"],
    },
    {
      id: 4,
      title: "The Batman",
      rating: 8.5,
      image:
        "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?auto=format&fit=crop&w=800&q=80",
      year: 2024,
      genre: ["Action", "Crime", "Drama"],
    },
    {
      id: 5,
      title: "Killers of the Flower Moon",
      rating: 8.7,
      image:
        "https://images.unsplash.com/photo-1533928298208-27ff66555d8d?auto=format&fit=crop&w=800&q=80",
      year: 2023,
      genre: ["Crime", "Drama", "History"],
    },
  ];

  const filteredMovies = search
    ? movies.filter((movie) =>
        movie.title
          .toLowerCase()
          .includes(search.toLowerCase())
      )
    : movies;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {search
            ? `Search results for "${search}"`
            : "Popular Movies"}
        </h1>

        <button className="flex items-center gap-2 bg-zinc-800 px-4 py-2 rounded-xl hover:bg-zinc-900 transition-colors">
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </button>
      </div>

      {/* Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredMovies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
          >
            <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300">
              <div className="relative aspect-video">
                <Image
                  src={movie.image}
                  alt={movie.title}
                  fill
                  className="object-cover"
                />

                <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-yellow-500 font-medium">
                    {movie.rating}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">
                  {movie.title}
                </h2>

                <div className="flex items-center justify-between">
                  <span className="text-zinc-400">
                    {movie.year}
                  </span>

                  <div className="flex gap-2">
                    {movie.genre
                      .slice(0, 2)
                      .map((g) => (
                        <span
                          key={g}
                          className="text-xs px-2 py-1 bg-zinc-800 rounded-full text-zinc-300"
                        >
                          {g}
                        </span>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
