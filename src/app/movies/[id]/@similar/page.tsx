import Image from "next/image";
import Link from "next/link";
import { getMovieById } from "@/data/movies/movie.service";
import { getSimilarMovies } from "@/data/movies/movie.service";

export default async function SimilarMoviesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const movieId = Number(id);

  const movie = await getMovieById(movieId);
  
  if (!movie) {
    return (
      <section>
        <p className="text-zinc-400">Movie not found</p>
      </section>
    );
  }

  // Fetch similar movies from TMDb
  let similarMovies = [];
  
  try {
    similarMovies = await getSimilarMovies(movieId);
  } catch (error) {
    console.error("Failed to fetch similar movies:", error);
  }

  if (similarMovies.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6">Similar Movies</h2>
        <p className="text-zinc-400">No similar movies found</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">
        Similar Movies
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {similarMovies.slice(0, 8).map((movie) => (
          <Link
            key={movie.id}
            href={`/movies/${movie.id}`}
            className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-[1.03] transition"
          >
            <Image
              src={movie.posterUrl || "/placeholder-movie.jpg"}
              alt={movie.title}
              width={300}
              height={450}
              className="object-cover w-full"
            />

            <div className="p-3">
              <p className="font-medium">
                {movie.title}
              </p>
              <p className="text-sm text-zinc-400">
                ⭐ {movie.rating?.toFixed(1) || "N/A"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
