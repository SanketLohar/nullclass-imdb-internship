import Image from "next/image";
import Link from "next/link";
import { MOVIES } from "@/data/movies";
import type { CastMember } from "@/data/movie.types";

export default function CastPage() {
  const movie = MOVIES[0];

  return (
    <section>
      <h2 className="text-2xl font-bold mb-6">Top Cast</h2>

      <div className="grid grid-cols-2 gap-6">
        {movie.cast.map((actor: CastMember) => (
          <Link
            key={actor.id}
            href={`/actor/${actor.id}`}
            className="bg-zinc-800/60 rounded-lg p-4 flex gap-4 hover:bg-zinc-700/60"
          >
            <Image
              src={actor.image}
              alt={actor.name}
              width={80}
              height={80}
              className="rounded-xl object-cover"
            />

            <div>
              <h3 className="font-semibold">{actor.name}</h3>
              <p className="text-sm text-zinc-400">{actor.role}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
