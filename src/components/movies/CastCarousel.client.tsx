"use client";

import Image from "next/image";
import type { MovieCast } from "@/data/movies/movie.credits.types";

type Props = {
  cast: MovieCast[];
};

export default function CastCarousel({ cast }: Props) {
  if (!cast || cast.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-6 py-12">
      <h2 className="mb-6 text-2xl font-bold text-white">
        Top Cast
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {cast.map((actor) => (
          <div
            key={actor.id}
            className="min-w-[160px] rounded-xl bg-white/10 p-4 backdrop-blur transition hover:bg-white/15"
          >
            {actor.profileUrl ? (
              <Image
                src={actor.profileUrl}
                alt={actor.name}
                width={160}
                height={220}
                className="rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-[220px] items-center justify-center rounded-lg bg-white/5 text-xs text-white/50">
                No Image
              </div>
            )}

            <h3 className="mt-3 text-sm font-semibold text-white">
              {actor.name}
            </h3>

            {actor.character && (
              <p className="text-xs text-white/70">
                {actor.character}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
