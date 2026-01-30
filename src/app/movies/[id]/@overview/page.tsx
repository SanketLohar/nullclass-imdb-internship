import { MOVIES } from "@/data/movies";

export default function OverviewPage() {
  const movie = MOVIES[0];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">
        Overview
      </h2>

      <p className="text-zinc-300 leading-relaxed">
        {movie.title} ({movie.releaseYear}) is rated ⭐ {movie.rating}/10.
        <br />
        {movie.overview}
      </p>
    </section>
  );
}
