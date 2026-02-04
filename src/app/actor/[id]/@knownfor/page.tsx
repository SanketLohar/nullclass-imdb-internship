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

  const { getActorFilmography } = await import("@/data/actors/actor.service");

  // Use the strict service that filters out garbage (no rating, no poster)
  // This ensures consistency with the "strict rules" requested.
  let filmography = await getActorFilmography(actorId);

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
