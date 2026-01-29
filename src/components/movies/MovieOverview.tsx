import type { Movie } from "@/data/movies/movie.types";

type Props = {
  movie: Movie;
};

export default function MovieOverview({
  movie,
}: Props) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10 space-y-4">
      <h2 className="text-xl font-semibold">
        Overview
      </h2>

      <p className="max-w-3xl text-sm leading-relaxed opacity-80">
        {movie.overview}
      </p>
    </section>
  );
}
