import type { Movie } from "./movie.types";
import type { MovieCredits } from "./movie.credits.types";

export type MovieBundle = {
  movie: Movie;
  credits: MovieCredits;
};
