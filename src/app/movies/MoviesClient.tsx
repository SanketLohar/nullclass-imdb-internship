"use client";

import { SlidersHorizontal, RefreshCw } from "lucide-react";
import PrefetchLink from "@/components/movies/PrefetchLink.client";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { tmdbService } from "@/lib/tmdb/tmdb.service";
import MovieCard from "@/components/MovieCard";
import OfflineError from "@/components/ui/OfflineError";

type Movie = {
    id: number;
    title: string;
    rating: number;
    image: string;
    year: number;
    genre: string[];
};

export default function MoviesClient() {
    const searchParams = useSearchParams();
    const search = searchParams.get("search");
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        async function fetchMovies() {
            setLoading(true);
            setError(null);
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
            } catch (err) {
                console.error("Failed to fetch movies:", err);
                setError(err instanceof Error ? err : new Error("Failed to fetch movies"));
            } finally {
                setLoading(false);
            }
        }
        fetchMovies();
    }, [search]);

    // Show error fallback UI (matches error boundary style)
    // Show error fallback UI (matches error boundary style)
    if (error) {
        return <OfflineError />;
    }

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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8">
                    {movies.map((movie) => (
                        <PrefetchLink
                            key={movie.id}
                            movieId={movie.id}
                            className="block"
                            prefetch={false} // Disable prefetch to avoid router crash offline? Maybe safer
                        >
                            <MovieCard
                                id={movie.id}
                                title={movie.title}
                                rating={movie.rating}
                                image={movie.image}
                                year={movie.year}
                                genre={movie.genre}
                            />
                        </PrefetchLink>
                    ))}
                </div>
            )}
        </div>
    );
}
