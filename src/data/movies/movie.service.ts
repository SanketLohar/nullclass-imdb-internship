import type { Movie } from "../movie.types";
import { MOVIES, MOVIE_TRAILERS } from "../movies";
import { tmdbService } from "@/lib/tmdb/tmdb.service";

/**
 * Fetch single movie with trailer support
 * Tries TMDb first, falls back to mock data
 */
export async function getMovieById(
  id: string | number
): Promise<Movie | null> {
  const movieId = typeof id === "string" ? Number(id) : id;
  
  // Try TMDb first if API key is available
  if (process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    try {
      const tmdbMovie = await tmdbService.getMovieDetails(movieId);
      const config = await tmdbService.getConfig();
      
      // Try to get trailer
      let trailer: string | undefined;
      try {
        const videos = await tmdbService.getMovieVideos(movieId);
        const trailerVideo = videos.results.find(v => v.site === "YouTube" && v.type === "Trailer");
        if (trailerVideo) {
          trailer = `https://www.youtube.com/watch?v=${trailerVideo.key}`;
        }
      } catch {
        // Fallback to mock trailers
      }
      
      return {
        id: tmdbMovie.id,
        title: tmdbMovie.title,
        overview: tmdbMovie.overview,
        releaseYear: new Date(tmdbMovie.release_date).getFullYear(),
        rating: tmdbMovie.vote_average,
        posterUrl: tmdbMovie.poster_path 
          ? `${config.images.secure_base_url}w500${tmdbMovie.poster_path}`
          : "/placeholder-movie.jpg",
        backdropUrl: tmdbMovie.backdrop_path
          ? `${config.images.secure_base_url}w1280${tmdbMovie.backdrop_path}`
          : "/placeholder-backdrop.jpg",
        runtime: 0, // TMDb doesn't provide runtime in basic details
        trailer,
        cast: [], // Will be fetched separately
      };
    } catch (error) {
      console.error("TMDb fetch failed, using mock data:", error);
      // Fall through to mock data
    }
  }
  
  // Fallback to mock data
  const movie = MOVIES.find((m) => m.id === movieId);
  if (!movie) return null;

  // Add trailer from MOVIE_TRAILERS if available
  const trailers = MOVIE_TRAILERS[movieId];
  if (trailers && trailers.length > 0) {
    const trailer = trailers[0];
    return {
      ...movie,
      trailer: `https://www.youtube.com/watch?v=${trailer.key}`,
    };
  }

  return movie;
}

/**
 * Get similar movies from TMDb
 */
export async function getSimilarMovies(movieId: number): Promise<Array<{ id: number; title: string; posterUrl: string; rating: number }>> {
  try {
    const { getSimilarMovies: getSimilar } = await import("@/lib/tmdb/tmdb.service");
    return await getSimilar(movieId);
  } catch (error) {
    console.error("Failed to fetch similar movies:", error);
    // Fallback to mock movies excluding current
    return MOVIES
      .filter(m => m.id !== movieId)
      .slice(0, 8)
      .map(m => ({
        id: m.id,
        title: m.title,
        posterUrl: m.posterUrl,
        rating: m.rating,
      }));
  }
}
