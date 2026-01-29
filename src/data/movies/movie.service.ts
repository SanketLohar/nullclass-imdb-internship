import type { Movie } from "./movie.types";
import { moviesMock } from "./movie.mock";

/**
 * Fetch single movie
 */
export async function getMovieById(
  id: string
): Promise<Movie | null> {
  const movie = moviesMock.find(
    (m) => m.id === id
  );

  return movie ?? null;
}
