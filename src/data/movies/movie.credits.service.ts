import type { MovieCredits } from "./movie.credits.types";
import { movieCreditsMock } from "./movie.credits.mock";

export async function getMovieCredits(
  movieId: string
): Promise<MovieCredits> {
  return (
    movieCreditsMock[movieId] ?? {
      cast: [],
      crew: [],
    }
  );
}
