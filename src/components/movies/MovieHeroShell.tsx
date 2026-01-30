import Image from "next/image";
import type { Movie } from "@/data/movie.types";

type Props = {
  movie: Movie;
};

export default function MovieHeroShell({
  movie,
}: Props) {
  return (
    <section className="relative h-[70vh] w-full bg-black text-white overflow-hidden">
      {movie.backdropUrl && (
        <Image
          src={movie.backdropUrl}
          alt={movie.title}
          fill
          priority
          className="object-cover opacity-40"
        />
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

      <div className="relative z-10 mx-auto flex h-full max-w-6xl items-end px-6 pb-16">
        <div>
          <h1 className="text-4xl font-bold">
            {movie.title}
          </h1>

          {movie.releaseYear && (
            <p className="mt-2 text-sm opacity-70">
              {movie.releaseYear}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
