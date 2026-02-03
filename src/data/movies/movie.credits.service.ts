import type { MovieCredits } from "./movie.credits.types";
import { movieCreditsMock } from "./movie.credits.mock";
import { tmdbService } from "@/lib/tmdb/tmdb.service";

export async function getMovieCredits(
  movieId: string | number
): Promise<MovieCredits> {
  const id =
    typeof movieId === "string" ? Number(movieId) : movieId;

  if (process.env.NEXT_PUBLIC_TMDB_API_KEY) {
    try {
      // Check if getMovieCredits method exists
      if (typeof tmdbService.getMovieCredits !== "function") {
        console.warn("getMovieCredits method not available, using mock data");
        // Fall through to mock data
      } else {
        const credits = await tmdbService.getMovieCredits(id);
        const config = await tmdbService.getConfig();

        // Gracefully handle invalid or missing credits data
        if (!credits || !credits.cast || !Array.isArray(credits.cast)) {
          console.warn("Invalid TMDb credits response, using mock data");
          // Fall through to mock data instead of throwing
        } else {
          return {
            cast: credits.cast.map((member) => ({
              id: String(member.id),
              name: member.name,
              role:
                member.character ||
                member.known_for_department ||
                "Actor",
              image: member.profile_path
                ? `${config.images.secure_base_url}w185${member.profile_path}`
                : "/placeholder-actor.jpg",
            })),

            crew: (credits.crew ?? []).map((member) => ({
              id: String(member.id),
              name: member.name,
              job: member.job,
              image: member.profile_path
                ? `${config.images.secure_base_url}w185${member.profile_path}`
                : "/placeholder-actor.jpg",
            })),
          };
        }
      }
    } catch (err) {
      console.error(
        "TMDb credits failed → using mock",
        err
      );
      // Fall through to mock data
    }
  }

  return (
    movieCreditsMock[String(id)] ?? {
      cast: [],
      crew: [],
    }
  );
}
