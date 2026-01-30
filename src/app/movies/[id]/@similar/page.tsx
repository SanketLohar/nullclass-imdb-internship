import Image from "next/image";
import Link from "next/link";
import { MOVIES } from "@/data/movies";

export default function SimilarMoviesPage() {
  const currentMovieId = 1; // mock (later from params)

  const similarMovies = MOVIES.filter(
    (movie) => movie.id !== currentMovieId
  );

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">
        Similar Movies
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {similarMovies.map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
            className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-[1.03] transition"
          >
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={300}
              height={450}
              className="object-cover"
            />

            <div className="p-3">
              <p className="font-medium">
                {movie.title}
              </p>
              <p className="text-sm text-zinc-400">
                ⭐ {movie.rating}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
