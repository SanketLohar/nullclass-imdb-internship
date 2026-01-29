import type { MovieCredits } from "@/data/movies/movie.credits.types";

type Props = {
  credits: MovieCredits;
};

export default function MovieCastSection({
  credits,
}: Props) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-10 space-y-4">
      <h2 className="text-xl font-semibold">
        Cast
      </h2>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 text-sm opacity-80">
        {credits.cast.map((actor) => (
          <li key={actor.id}>
            <p className="font-medium">
              {actor.name}
            </p>

            {actor.character && (
              <p className="text-xs opacity-60">
                {actor.character}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
