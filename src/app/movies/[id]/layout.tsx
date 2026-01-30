import Image from "next/image";
import { MOVIES } from "@/data/movies";

export default async function MovieLayout({
  params,
  overview,
  cast,
  reviews,
  similar,
}: {
  params: Promise<{ id: string }>;
  overview: React.ReactNode;
  cast: React.ReactNode;
  reviews: React.ReactNode;
  similar: React.ReactNode;
}) {
  const { id } = await params;

  const movie =
    MOVIES.find((m) => m.id === Number(id)) ??
    MOVIES[0];

  return (
    <div>
      {/* HERO — ONLY HERE */}
      <div className="relative h-[90vh]">
        <Image
          src={movie.backdropUrl}
          alt={movie.title}
          fill
          priority
          className="object-cover"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80" />

        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div>
            <h1 className="text-5xl font-bold mb-4">
              {movie.title}
            </h1>

            <p className="text-zinc-300 max-w-2xl">
              {movie.overview}
            </p>

            <div className="flex gap-6 mt-4 text-sm text-zinc-400">
              <span>📅 {movie.releaseYear}</span>
              <span>⭐ {movie.rating}</span>
              <span>⏱ {movie.runtime} min</span>
            </div>
          </div>
        </div>
      </div>

      {/* PARALLEL ROUTES */}
      <main className="container mx-auto px-4 py-16 space-y-24">
        {overview}
        {cast}
        {reviews}
        {similar}
      </main>
    </div>
  );
}
