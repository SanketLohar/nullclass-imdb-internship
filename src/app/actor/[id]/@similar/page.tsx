import { getActorById } from "@/data/actors/actor.service";
import Image from "next/image";
import Link from "next/link";

export default async function SimilarActorsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actorId = Number(id);

  let similarActors: any[] = [];

  // Try fetching dynamic similar actors (co-stars) from TMDB
  if (process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    try {
      const { getSimilarActors } = await import("@/lib/tmdb/tmdb.service");
      similarActors = await getSimilarActors(actorId);
    } catch (e) {
      console.error("Failed to fetch similar actors", e);
    }
  }

  // Fallback to mock data
  if (similarActors.length === 0) {
    const actor = await getActorById(actorId);
    if (actor && actor.similarActors) {
      similarActors = actor.similarActors;
    }
  }

  if (similarActors.length === 0) {
    return null;
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">
        Similar Actors
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {similarActors.map((similar: any) => (
          <Link
            key={similar.id}
            href={`/actor/${similar.id}`}
            className="group"
          >
            <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-2 bg-zinc-800">
              <Image
                src={similar.image}
                alt={similar.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform"
                sizes="(max-width: 768px) 50vw, 25vw"
                loading="lazy"
              />
            </div>
            <div className="text-center">
              <p className="font-medium group-hover:text-yellow-400 transition-colors truncate">
                {similar.name}
              </p>
              {similar.role && (
                <p className="text-xs text-zinc-500 truncate">
                  {similar.role}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
