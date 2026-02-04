// TMDb API abstraction layer
import { retryWithBackoff } from "../cache/retry";
import { createCircuitBreaker } from "../cache/circuit-breaker";
import { coalesceRequest } from "../cache/request-coalesce";

const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || "";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const circuitBreaker = createCircuitBreaker({
  failureThreshold: 5,
  resetTimeout: 60000,
});

interface TMDBConfig {
  images: {
    base_url: string;
    secure_base_url: string;
  };
}

interface TMDBMovie {
  id: number;
  imdb_id: string;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  vote_average: number;
  vote_count: number;
  runtime?: number | null;
  tagline?: string | null;
  status?: string;
  genres?: { id: number; name: string }[];
}

interface TMDBResponse<T> {
  results: T[];
  page: number;
  total_pages: number;
  total_results: number;
}

class TMDBService {
  private async request<T>(
    endpoint: string,
    params?: Record<string, string>
  ): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
    url.searchParams.set("api_key", TMDB_API_KEY);
    url.searchParams.set("language", "en-US");
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
    }

    return circuitBreaker.execute(
      async () => {
        return retryWithBackoff(async () => {
          const response = await fetch(url.toString(), {
            headers: {
              Accept: "application/json",
            },
            next: {
              revalidate: 3600, // Cache for 1 hour
            },
          });

          if (!response.ok) {
            if (response.status === 429) {
              throw new Error("Rate limit exceeded");
            }
            throw new Error(`TMDB API error: ${response.statusText}`);
          }

          return response.json();
        });
      },
      () => {
        // Fallback to mock data
        return this.getMockData<T>(endpoint);
      }
    );
  }

  private getMockData<T>(endpoint: string): T {
    // Return empty/mock data as fallback
    if (endpoint.includes("/search")) {
      return { results: [], page: 1, total_pages: 0, total_results: 0 } as T;
    }
    return {} as T;
  }

  private isValidMovie(movie: TMDBMovie): boolean {
    return (
      !!movie.id &&
      typeof movie.title === "string" &&
      movie.title.trim().length > 0 &&
      movie.vote_average > 0 && // Ensure it has been rated
      (!!movie.poster_path || !!movie.backdrop_path) && // Must have visual
      !/^[0-9]+$/.test(movie.title) // Reject numeric-only titles (garbage)
    );
  }

  async searchMovies(query: string, page = 1): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = `tmdb-search-${query}-${page}`;
    const data = await coalesceRequest(cacheKey, () =>
      this.request<TMDBResponse<TMDBMovie>>("/search/movie", {
        query,
        page: page.toString(),
      })
    );
    data.results = data.results.filter(this.isValidMovie);
    return data;
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    const cacheKey = `tmdb-movie-${movieId}`;
    const movie = await coalesceRequest(cacheKey, () =>
      this.request<TMDBMovie>(`/movie/${movieId}`)
    );

    if (!this.isValidMovie(movie)) {
      throw new Error("Invalid movie data");
    }
    return movie;
  }

  async getPopularMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = `tmdb-popular-${page}`;
    const data = await coalesceRequest(cacheKey, () =>
      this.request<TMDBResponse<TMDBMovie>>("/movie/popular", {
        page: page.toString(),
      })
    );
    data.results = data.results.filter(this.isValidMovie);
    return data;
  }

  async getTopRatedMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = `tmdb-top-rated-${page}`;
    const data = await coalesceRequest(cacheKey, () =>
      this.request<TMDBResponse<TMDBMovie>>("/movie/top_rated", {
        page: page.toString(),
      })
    );
    data.results = data.results.filter(this.isValidMovie);
    return data;
  }

  async getUpcomingMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = `tmdb-upcoming-${page}`;
    const data = await coalesceRequest(cacheKey, () =>
      this.request<TMDBResponse<TMDBMovie>>("/movie/upcoming", {
        page: page.toString(),
      })
    );
    data.results = data.results.filter(this.isValidMovie);
    return data;
  }

  async getImageUrl(path: string | null, size = "w780"): Promise<string> {
    if (!path) return "";
    const config = await this.getConfig();
    return `${config.images.secure_base_url}${size}${path}`;
  }

  private configCache: TMDBConfig | null = null;
  async getConfig(): Promise<TMDBConfig> {
    if (this.configCache) return this.configCache;
    this.configCache = await this.request<TMDBConfig>("/configuration");
    return this.configCache;
  }

  async getMovieVideos(movieId: number): Promise<{ results: Array<{ key: string; type: string; site: string }> }> {
    const cacheKey = `tmdb-videos-${movieId}`;
    return coalesceRequest(cacheKey, () =>
      this.request<{ results: Array<{ key: string; type: string; site: string }> }>(`/movie/${movieId}/videos`)
    );
  }

  async getMovieImages(movieId: number): Promise<{ backdrops: Array<{ file_path: string }> }> {
    const cacheKey = `tmdb-images-${movieId}`;
    return coalesceRequest(cacheKey, () =>
      this.request<{ backdrops: Array<{ file_path: string }> }>(`/movie/${movieId}/images`)
    );
  }

  async getMovieExternalIds(movieId: number): Promise<{ imdb_id?: string }> {
    const cacheKey = `tmdb-external-${movieId}`;
    return coalesceRequest(cacheKey, () =>
      this.request<{ imdb_id?: string }>(`/movie/${movieId}/external_ids`)
    );
  }

  async getSimilarMovies(movieId: number, page = 1): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = `tmdb-similar-${movieId}-${page}`;
    const data = await coalesceRequest(cacheKey, () =>
      this.request<TMDBResponse<TMDBMovie>>(`/movie/${movieId}/similar`, {
        page: page.toString(),
      })
        .catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 } as TMDBResponse<TMDBMovie>)) // Handle invalid ID downstream
    );

    // Ensure data.results exists before filtering (in case of total failure)
    if (data && data.results) {
      data.results = data.results.filter(this.isValidMovie);
    } else {
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }

    return data;
  }

  async getMovieCredits(movieId: number): Promise<{ cast: any[]; crew: any[] }> {
    const cacheKey = `tmdb-credits-${movieId}`;
    return coalesceRequest(cacheKey, () =>
      this.request<{ cast: any[]; crew: any[] }>(`/movie/${movieId}/credits`)
    );
  }

  async getActorDetails(actorId: number): Promise<any> {
    const cacheKey = `tmdb-actor-${actorId}`;
    return coalesceRequest(cacheKey, () =>
      this.request<any>(`/person/${actorId}`, { append_to_response: "external_ids" })
    );
  }

  async getActorCredits(actorId: number): Promise<{ cast: any[] }> {
    const cacheKey = `tmdb-actor-credits-${actorId}`;
    return coalesceRequest(cacheKey, () =>
      this.request<{ cast: any[] }>(`/person/${actorId}/movie_credits`)
    );
  }

  async getComingSoonMovies(): Promise<TMDBMovie[]> {
    // Fetch first 3 pages to find enough 2026+ movies
    const pages = [1, 2, 3];
    const results = await Promise.all(
      pages.map(page => this.request<TMDBResponse<TMDBMovie>>("/movie/upcoming", { page: page.toString() }))
    );

    const allMovies = results.flatMap(r => r.results);
    const uniqueMovies = Array.from(new Map(allMovies.map(m => [m.id, m])).values());

    // Filter for 2026+ AND Valid
    return uniqueMovies.filter(m => {
      if (!this.isValidMovie(m)) return false; // Use strict validation
      if (!m.release_date) return false;
      const year = new Date(m.release_date).getFullYear();
      return year >= 2026;
    });
  }

  async getPopularActors(page = 1): Promise<TMDBResponse<any>> {
    const cacheKey = `tmdb-popular-actors-${page}`;
    const data = await coalesceRequest(cacheKey, () =>
      this.request<TMDBResponse<any>>("/person/popular", {
        page: page.toString(),
      })
    );

    // Ensure safe return
    if (!data || !data.results) {
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
    return data;
  }

  async getSimilarActors(actorId: number): Promise<any[]> {
    try {
      // 1. Get actor's credits
      const credits = await this.getActorCredits(actorId);

      if (!credits?.cast || credits.cast.length === 0) return [];

      // 2. Find their most popular/rated movie
      const topMovie = credits.cast
        .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
        .find(m => m.poster_path); // ensure it has image

      if (!topMovie) return [];

      // 3. Get cast of that movie
      const movieCredits = await this.getMovieCredits(topMovie.id);

      if (!movieCredits?.cast) return [];

      // 4. Return top co-stars (excluding self)
      return movieCredits.cast
        .filter(c => c.id !== actorId && c.profile_path)
        .slice(0, 4) // Limit to 4
        .map(c => ({
          id: c.id,
          name: c.name,
          image: c.profile_path
            ? `https://image.tmdb.org/t/p/w780${c.profile_path}`
            : "/placeholder-actor.jpg",
          role: `Co-star in ${topMovie.title}`
        }));
    } catch (e) {
      console.error("Error fetching similar actors:", e);
      return [];
    }
  }
}

export const tmdbService = new TMDBService();
export type { TMDBMovie, TMDBResponse };

// Export convenience functions
export async function getMovieTrailers(movieId: number): Promise<string[]> {
  try {
    const videos = await tmdbService.getMovieVideos(movieId);
    return videos.results
      .filter(v => v.site === "YouTube" && v.type === "Trailer")
      .map(v => `https://www.youtube.com/watch?v=${v.key}`);
  } catch {
    return [];
  }
}

export async function getMovieImages(movieId: number): Promise<{ backdrops: Array<{ file_path: string }> } | null> {
  try {
    return await tmdbService.getMovieImages(movieId);
  } catch {
    return null;
  }
}

export async function getSimilarMovies(movieId: number): Promise<Array<{ id: number; title: string; posterUrl: string; rating: number }>> {
  try {
    const response = await tmdbService.getSimilarMovies(movieId);
    const config = await tmdbService.getConfig();

    return response.results.map(movie => ({
      id: movie.id,
      title: movie.title,
      posterUrl: movie.poster_path
        ? `${config.images.secure_base_url}w780${movie.poster_path}`
        : "/placeholder-movie.jpg",
      rating: movie.vote_average,
    }));
  } catch {
    return [];
  }
}

export async function getComingSoonMovies() {
  try {
    const movies = await tmdbService.getComingSoonMovies();
    const config = await tmdbService.getConfig();

    return movies.map(movie => ({
      id: movie.id,
      title: movie.title,
      posterUrl: movie.poster_path
        ? `${config.images.secure_base_url}w780${movie.poster_path}`
        : "/placeholder-movie.jpg",
      rating: movie.vote_average,
      releaseYear: new Date(movie.release_date).getFullYear(),
      genre: [] // Add genre mapping if needed or leave empty
    }));
  } catch (error) {
    console.error("Failed to get coming soon movies", error);
    return [];
  }
}

export async function getSimilarActors(actorId: number) {
  return tmdbService.getSimilarActors(actorId);
}
