import { notFound } from "next/navigation";
import { getMovieBundle } from "@/data/movies/movie.bundle.service";

import MovieHero from "@/components/movies/MovieHero.client";
import MovieOverview from "@/components/movies/MovieOverview";
import MovieCastSection from "@/components/movies/MovieCastSection";
import CastCarousel from "@/components/movies/CastCarousel.client";

type PageProps = {
  params: Promise<{ id: string }>;
};

export default async function MoviePage({ params }: PageProps) {
  const { id } = await params;

  const bundle = await getMovieBundle(id);
  if (!bundle) notFound();

  const { movie, credits } = bundle;

  return (
    <main className="bg-black text-white">
      <MovieHero movie={movie} />

      <MovieOverview movie={movie} />
<CastCarousel cast={credits.cast} />
    </main>
  );
}
