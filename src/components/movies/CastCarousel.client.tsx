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
      <h2 className="mb-6 text-2xl font-bold text-foreground">
        Top Cast
      </h2>

      <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
        {cast.map((actor) => (
          <div
            key={actor.id}
            className="min-w-[160px] rounded-xl bg-card border border-border p-4 transition hover:bg-secondary/50"
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
              <div className="flex h-[220px] items-center justify-center rounded-lg bg-muted text-xs text-muted-foreground">
                No Image
              </div>
            )}

            <h3 className="mt-3 text-sm font-semibold text-foreground truncate">
              {actor.name}
            </h3>

            {actor.character && (
              <p className="text-xs text-muted-foreground truncate">
                {actor.character}
              </p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
