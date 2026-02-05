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
  genre_ids?: number[];
  popularity?: number;
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
    if (
      endpoint.includes("/search") ||
      endpoint.includes("/movie/popular") ||
      endpoint.includes("/movie/top_rated") ||
      endpoint.includes("/movie/upcoming") ||
      endpoint.includes("/discover/movie")
    ) {
      return { results: [], page: 1, total_pages: 0, total_results: 0 } as T;
    }
    if (endpoint.includes("/configuration")) {
      return {
        images: {
          base_url: "http://image.tmdb.org/t/p/",
          secure_base_url: "https://image.tmdb.org/t/p/",
        },
      } as T;
    }
    if (endpoint.includes("/videos")) {
      return { results: [] } as T;
    }
    if (endpoint.includes("/images")) {
      return { backdrops: [], posters: [] } as T;
    }
    if (endpoint.includes("/credits")) {
      return { cast: [], crew: [] } as T;
    }
    if (endpoint.includes("/external_ids")) {
      return { imdb_id: undefined } as T;
    }
    return {} as T;
  }

  private isValidMovie(movie: TMDBMovie): boolean {
    return (
      !!movie.id &&
      typeof movie.title === "string" &&
      movie.title.trim().length > 0 &&
      // movie.vote_average > 0 && // ALLOW unrated movies (new releases)
      // (!!movie.poster_path || !!movie.backdrop_path) && // ALLOW missing images (placeholders used)
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
    if (data && data.results) {
      data.results = data.results.filter(this.isValidMovie);
    } else {
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
    return data;
  }

  async getMovieDetails(movieId: number): Promise<TMDBMovie> {
    const cacheKey = `tmdb-movie-${movieId}`;
    const movie = await coalesceRequest(cacheKey, () =>
      this.request<TMDBMovie>(`/movie/${movieId}`)
    );

    if (!this.isValidMovie(movie)) {
      // throw new Error("Invalid movie data"); // Don't throw, just return "empty" or handle upstream
      // Actually, for getMovieDetails, we should probably return null if invalid, 
      // but the return type is TMDBMovie. Let's allowing it if ID exists.
      console.warn(`[TMDB] Relaxed validation for movie ${movieId}`);
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
    if (data && data.results) {
      data.results = data.results.filter(this.isValidMovie);
    } else {
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
    return data;
  }

  async getTopRatedMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = `tmdb-top-rated-${page}`;
    const data = await coalesceRequest(cacheKey, () =>
      this.request<TMDBResponse<TMDBMovie>>("/movie/top_rated", {
        page: page.toString(),
      })
    );
    if (data && data.results) {
      data.results = data.results.filter(this.isValidMovie);
    } else {
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
    return data;
  }

  async getUpcomingMovies(page = 1): Promise<TMDBResponse<TMDBMovie>> {
    const cacheKey = `tmdb-upcoming-${page}`;
    const data = await coalesceRequest(cacheKey, () =>
      this.request<TMDBResponse<TMDBMovie>>("/movie/upcoming", {
        page: page.toString(),
      })
    );
    if (data && data.results) {
      data.results = data.results.filter(this.isValidMovie);
    } else {
      return { results: [], page: 1, total_pages: 0, total_results: 0 };
    }
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
    // 1. Fetch Global Blockbusters for March 2026+
    const globalPages = [1, 2, 3];
    const globalPromise = Promise.all(
      globalPages.map((page) =>
        this.request<TMDBResponse<TMDBMovie>>("/discover/movie", {
          page: page.toString(),
          "primary_release_date.gte": "2026-03-01",
          sort_by: "popularity.desc",
          "vote_count.gte": "0", // Include unreleased with anticipation
        }).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 } as TMDBResponse<TMDBMovie>))
      )
    );

    // 2. Fetch specific Indian Blockbusters for March 2026+
    const indianPages = [1, 2]; // Fetch a few pages of Indian content
    const indianPromise = Promise.all(
      indianPages.map((page) =>
        this.request<TMDBResponse<TMDBMovie>>("/discover/movie", {
          page: page.toString(),
          "primary_release_date.gte": "2026-03-01",
          with_origin_country: "IN",
          sort_by: "popularity.desc",
        }).catch(() => ({ results: [], page: 1, total_pages: 0, total_results: 0 } as TMDBResponse<TMDBMovie>))
      )
    );

    const [globalResults, indianResults] = await Promise.all([globalPromise, indianPromise]);

    const allMovies = [
      ...globalResults.flatMap((r) => r.results),
      ...indianResults.flatMap((r) => r.results),
    ].filter((r) => r && r.id); // Basic filter

    // Deduplicate by ID
    const uniqueMovies = Array.from(new Map(allMovies.map((m) => [m.id, m])).values());

    // Strict Validation
    const validMovies = uniqueMovies.filter((m) => {
      // Basic validity
      if (!m.title || m.title.trim().length === 0) return false;
      if (!m.id) return false;
      if ((m as any).adult) return false;

      // Ensure it is actually March 2026+
      if (m.release_date) {
        const releaseDate = new Date(m.release_date);
        const cutoffDate = new Date("2026-03-01");
        if (releaseDate < cutoffDate) return false;
      }

      // STRICTLY REQUIRE POSTER (User Request)
      if (!m.poster_path) return false;

      return true;
    });

    // Sort by popularity but prioritize those with release dates? Just simple popularity sort.
    return validMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
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
            : "/placeholder-actor.svg",
          role: `Co-star in ${topMovie.title}`
        }));
    } catch (e) {
      console.warn("Error fetching similar actors:", e instanceof Error ? e.message : "Unknown error");
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

export async function getSimilarMovies(movieId: number): Promise<Array<{ id: number; title: string; posterUrl: string; rating: number; genre_ids: number[] }>> {
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
      genre_ids: movie.genre_ids || [],
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
    console.warn("Failed to get coming soon movies (using fallback)", error instanceof Error ? error.message : "Unknown error");
    return [];
  }
}

export async function getSimilarActors(actorId: number) {
  return tmdbService.getSimilarActors(actorId);
}
