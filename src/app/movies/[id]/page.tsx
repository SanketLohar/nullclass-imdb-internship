import Image from "next/image";
import { notFound } from "next/navigation";
import { tmdbService } from "@/lib/tmdb/tmdb.service";
import { getMovieAwards } from "@/lib/omdb/omdb.service";
import TrailerPlayer from "@/components/movies/TrailerPlayer";
import MovieHero from "@/components/movies/MovieHero.client";

/* ---------------- FETCH ---------------- */

async function getMovie(id: string) {
  const movieId = Number(id);
  if (isNaN(movieId)) return null;

  try {
    const [movie, config, videos] = await Promise.all([
      tmdbService.getMovieDetails(movieId),
      tmdbService.getConfig(),
      tmdbService.getMovieVideos(movieId),
    ]);

    const trailer = videos.results.find(
      (v) => v.site === "YouTube" && v.type === "Trailer"
    );

    return {
      id: movie.id,
      title: movie.title,
      rating: movie.vote_average,
      releaseYear: new Date(movie.release_date).getFullYear(),
      runtime: movie.runtime ?? 0,
      overview: movie.overview,
      posterUrl: movie.poster_path
        ? `${config.images.secure_base_url}w500${movie.poster_path}`
        : "/placeholder-movie.jpg",
      backdropUrl: movie.backdrop_path
        ? `${config.images.secure_base_url}original${movie.backdrop_path}`
        : "/placeholder-backdrop.jpg",
      trailerKey: trailer?.key ?? "",
      awards: movie.imdb_id
        ? await getMovieAwards(movie.imdb_id)
        : "No awards information available.",
    };
  } catch {
    return null;
  }
}

/* ---------------- PAGE ---------------- */

export default async function MovieDetailsPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await props.params;
  const searchParams = await props.searchParams;

  const movie = await getMovie(params.id);
  if (!movie) notFound();

  return (
    <>
      {/* ✅ URL DRIVEN TRAILER */}
      {movie.trailerKey && (
        <TrailerPlayer
          videoKey={movie.trailerKey}
          initialPlay={searchParams.play === "true"}
        />
      )}

      {/* ✅ HERO */}
      <MovieHero movie={movie} />
    </>
  );
}
