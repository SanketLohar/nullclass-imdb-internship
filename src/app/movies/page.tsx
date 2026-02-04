"use client";

import { SlidersHorizontal, Star } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { tmdbService } from "@/lib/tmdb/tmdb.service";
import MovieCard from "@/components/MovieCard";

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
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMovies() {
      setLoading(true);
      try {
        if (search) {
          // Search TMDb
          const results = await tmdbService.searchMovies(search);
          const config = await tmdbService.getConfig();
          const mapped = results.results
            .filter(m => m.poster_path && m.release_date)
            .map(m => ({
              id: m.id,
              title: m.title,
              rating: m.vote_average,
              image: m.poster_path
                ? `${config.images.secure_base_url}w780${m.poster_path}`
                : "/placeholder-movie.jpg",
              year: new Date(m.release_date).getFullYear(),
              genre: [], // TMDb doesn't provide genres in search results
            }));
          setMovies(mapped);
        } else {
          // Get popular movies from TMDb
          const results = await tmdbService.getPopularMovies();
          const config = await tmdbService.getConfig();
          const mapped = results.results
            .filter(m => m.poster_path && m.release_date)
            .map(m => ({
              id: m.id,
              title: m.title,
              rating: m.vote_average,
              image: m.poster_path
                ? `${config.images.secure_base_url}w780${m.poster_path}`
                : "/placeholder-movie.jpg",
              year: new Date(m.release_date).getFullYear(),
              genre: [],
            }));
          setMovies(mapped);
        }
      } catch (error) {
        console.error("Failed to fetch movies:", error);
        // Fallback to empty array
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }
    fetchMovies();
  }, [search]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <p className="text-zinc-400">Loading movies...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {search
            ? `Search results for "${search}"`
            : "Popular Movies"}
        </h1>

        <button className="flex items-center gap-2 bg-secondary text-foreground px-4 py-2 rounded-xl hover:bg-secondary/80 transition-colors">
          <SlidersHorizontal className="w-5 h-5" />
          Filters
        </button>
      </div>

      {movies.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-zinc-400 text-lg">
            {search ? `No movies found for "${search}"` : "No movies available"}
          </p>
        </div>
      ) : (
        /* Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {movies.map((movie) => (
            <Link
              key={movie.id}
              href={`/movies/${movie.id}`}
              className="block"
            >
              <MovieCard
                id={movie.id}
                title={movie.title}
                rating={movie.rating}
                image={movie.image}
                year={movie.year}
                genre={movie.genre}
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
