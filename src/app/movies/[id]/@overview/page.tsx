import { Suspense } from "react";
import { getMovieById } from "@/data/movies/movie.service";
import TrailerCarousel from "@/components/movies/TrailerCarousel.client";
import { tmdbService } from "@/lib/tmdb/tmdb.service";

export default async function OverviewPage({
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
        <p className="text-muted-foreground">Movie not found</p>
      </section>
    );
  }

  let trailers: string[] = [];
  let images: string[] = [];

  try {
    const videoData =
      await tmdbService.getMovieVideos(movieId);

    const imageData =
      await tmdbService.getMovieImages(movieId);

    const config =
      await tmdbService.getConfig();

    trailers =
      videoData.results
        ?.filter(
          (v) =>
            v.site === "YouTube" &&
            v.type === "Trailer"
        )
        .map((v) => v.key) || [];

    images =
      imageData.backdrops
        ?.slice(0, 10)
        .map(
          (img) =>
            `${config.images.secure_base_url}w1280${img.file_path}`
        ) || [];
  } catch (e) {
    console.error("Media load failed", e);
  }

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">
        Overview
      </h2>

      <p className="text-muted-foreground leading-relaxed mb-8">
        {movie.title} ({movie.releaseYear}) is rated ⭐{" "}
        {movie.rating}/10.
        <br />
        {movie.overview}
      </p>

      {(trailers.length > 0 ||
        images.length > 0) && (
          <Suspense
            fallback={
              <div className="h-64 bg-muted/60 rounded-lg animate-pulse" />
            }
          >
            <TrailerCarousel
              trailers={trailers}
              images={images}
            />

          </Suspense>
        )}
    </section>
  );
}
