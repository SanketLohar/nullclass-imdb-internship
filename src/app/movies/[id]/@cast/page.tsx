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
      cast = credits.cast.slice(0, 10).map(c => ({
        id: Number(c.id),
        name: c.name,
        role: c.character || "Unknown",
        image: c.profileUrl || ""
      }));
    }
  } catch (error) {
    console.warn("Failed to fetch credits (using fallback):", error instanceof Error ? error.message : "Unknown error");
    // Fallback to movie.cast if available
    if (movie.cast && movie.cast.length > 0) {
      cast = movie.cast;
    }
  }

  if (cast.length === 0) {
    return (
      <section>
        <h2 className="text-2xl font-bold mb-6 text-foreground">Top Cast</h2>
        <p className="text-muted-foreground">No cast information available</p>
      </section>
    );
  }

  return (
    <section className="pt-16 relative">
      <h2 className="text-2xl font-bold mb-6 text-foreground">
        Top Cast
      </h2>

      <div className="grid grid-cols-2 gap-6">
        {cast.map((actor: CastMember) => (
          <Link
            key={actor.id}
            href={`/actor/${actor.id}`}
            className="bg-card border border-border rounded-lg p-4 flex gap-4 hover:bg-secondary/50 transition"
          >
            <Image
              src={actor.image || "/placeholder-actor.svg"}
              alt={actor.name}
              width={80}
              height={80}
              className="rounded-xl object-cover"
            />

            <div>
              <h3 className="font-semibold text-foreground">
                {actor.name}
              </h3>
              <p className="text-sm text-muted-foreground">
                {actor.role}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
