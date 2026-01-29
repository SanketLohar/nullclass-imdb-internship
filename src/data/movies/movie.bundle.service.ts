import { getMovieById } from "./movie.service";
import { getMovieCredits } from "./movie.credits.service";
import type { MovieBundle } from "./movie.bundle.types";

export async function getMovieBundle(
  movieId: string
): Promise<MovieBundle | null> {
  const movie = await getMovieById(movieId);

  if (!movie) return null;

  const credits = await getMovieCredits(movieId);

  return {
    movie,
    credits,
  };
}
