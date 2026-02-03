import { getActorById } from "@/data/actors/actor.service";
import FilmographyExplorer from "@/components/actors/FilmographyExplorer.client";
import { Suspense } from "react";

export default async function KnownForPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actorId = Number(id);

  let filmography: any[] = [];

  if (process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    try {
      const { tmdbService } = await import("@/lib/tmdb/tmdb.service");
      const [credits, config] = await Promise.all([
        tmdbService.getActorCredits(actorId),
        tmdbService.getConfig()
      ]);

      filmography = (credits?.cast || []).map(c => ({
        id: c.id,
        title: c.title,
        role: c.character,
        year: c.release_date ? new Date(c.release_date).getFullYear() : 0,
        image: c.poster_path
          ? `${config.images.secure_base_url}w500${c.poster_path}`
          : "/placeholder-movie.jpg",
        poster: c.poster_path
          ? `${config.images.secure_base_url}w500${c.poster_path}`
          : "/placeholder-movie.jpg",
        rating: c.vote_average,
        genre: "" // Genre needing extra fetch, leaving empty for list
      }));

    } catch (e) {
      console.error("Failed to fetch filmography", e);
    }
  }

  // Fallback to mock if empty (and if mock exists, but for now we assume TMDB works or we leave empty)
  if (filmography.length === 0) {
    const actor = await getActorById(actorId);
    if (actor) {
      filmography = actor.filmography || [];
    }
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">
        Filmography
      </h2>

      <Suspense
        fallback={
          <div className="h-[600px] flex items-center justify-center">
            <div className="text-zinc-400">Loading filmography...</div>
          </div>
        }
      >
        <FilmographyExplorer filmography={filmography} />
      </Suspense>
    </section>
  );
}
