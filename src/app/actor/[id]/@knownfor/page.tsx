import Image from "next/image";
import { ACTORS } from "@/data/actors";

export default async function KnownForPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const actor =
    ACTORS.find((a) => a.id === Number(id)) ??
    ACTORS[0];

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6">
        Filmography
      </h2>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        {actor.filmography.map((movie) => (
          <div
            key={movie.id}
            className="rounded-xl overflow-hidden bg-zinc-900 hover:scale-[1.03] transition"
          >
            <div className="relative aspect-[2/3]">
              <Image
                src={movie.poster}
                alt={movie.title}
                fill
                className="object-cover"
              />
            </div>

            <div className="p-3">
              <p className="font-medium">
                {movie.title}
              </p>

              <p className="text-sm text-zinc-400">
                {movie.year} · {movie.role}
              </p>

              <p className="text-xs text-yellow-400 mt-1">
                ⭐ {movie.rating}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
