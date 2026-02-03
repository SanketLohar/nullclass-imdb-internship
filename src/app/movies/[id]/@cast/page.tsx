import Image from "next/image";
import Link from "next/link";
import { getMovieById } from "@/data/movies/movie.service";
import { getMovieCredits } from "@/data/movies/movie.credits.service";
import type { CastMember } from "@/data/movie.types";

export default async function CastPage({
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

  // Fetch credits from TMDb or use movie.cast
  let cast: CastMember[] = movie.cast || [];
  
  try {
    const credits = await getMovieCredits(movieId);
    if (credits?.cast && credits.cast.length > 0) {
      cast = credits.cast.slice(0, 10); // Top 10 cast members
    }
  } catch (error) {
    console.error("Failed to fetch credits:", error);
    // Fallback to movie.cast if available
    if (movie.cast && movie.cast.length > 0) {
      cast = movie.cast;
    }
  }

  if (cast.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6">Top Cast</h2>
        <p className="text-zinc-400">No cast information available</p>
      </section>
    );
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">
        Top Cast
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {cast.map((actor: CastMember) => (
          <Link
            key={actor.id}
            href={`/actor/${actor.id}`}
            className="bg-zinc-800/60 rounded-lg p-4 flex gap-4 hover:bg-zinc-700/60 transition"
          >
            <Image
              src={actor.image || "/placeholder-actor.jpg"}
              alt={actor.name}
              width={80}
              height={80}
              className="rounded-xl object-cover"
            />

            <div>
              <h3 className="font-semibold">
                {actor.name}
              </h3>
              <p className="text-sm text-zinc-400">
                {actor.role}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
