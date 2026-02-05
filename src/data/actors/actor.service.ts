// Actor service with edge runtime support and caching
import { Actor, FilmographyItem, ActorAward } from "../actors.types";
import { getMovieAwards } from "@/lib/omdb/omdb.service";
import { tmdbService } from "@/lib/tmdb/tmdb.service";
import { revalidateTag } from "next/cache";

export function getRevalidationTag(actorId: number): string {
  return `actor-${actorId}`;
}

export async function revalidateActor(actorId: number) {
  const tag = getRevalidationTag(actorId);
  // @ts-ignore
  revalidateTag(tag);
  console.log(`[Revalidate] Tag: ${tag}`);
}

export async function getActorById(id: number, options?: { strict?: boolean; skipAwards?: boolean; revalidate?: boolean }): Promise<Actor | null> {
  try {
    const [details, credits] = await Promise.all([
      tmdbService.getActorDetails(id),
      tmdbService.getActorCredits(id)
    ]);

    console.log(`[ActorDebug] ID: ${id}, Details:`, JSON.stringify(details));

    if (!details || !details.id) {
      console.log(`[ActorDebug] Returning null because details is invalid. ID=${id}. Details=${JSON.stringify(details)}`);
      return null;
    } else {
      console.log(`[ActorDebug] Details found for ${id}. Name: ${details.name}`);
    }

    // Fail Fast: Strict Mode Checks
    if (options?.strict) {
      const hasBio = details.biography && details.biography.length > 50 && details.biography !== "No biography available.";
      const hasImdb = !!details.imdb_id;

      if (!hasBio || !hasImdb) {
        // console.log(`[Skipped] ${details.name} (ID: ${id}) - Missing Bio or IMDb`);
        return null;
      }
    }

    // Process filmography
    const cast = credits?.cast || [];
    // Deduplicate by ID immediately
    const uniqueCast = cast.filter((m: any, index: number, self: any[]) =>
      index === self.findIndex((t) => t.id === m.id)
    );

    const filmography: FilmographyItem[] = uniqueCast
      .filter((m: any) =>
        m.id &&
        m.poster_path &&
        // m.release_date && // Allow missing date
        // m.vote_average > 0 && // Allow unrated
        // m.vote_count > 0 && // Allow no votes
        m.title
      ) // Filter out items with no title or ID
      .map((m: any) => ({
        id: m.id,
        title: m.title,
        role: m.character || "Actor",
        year: m.release_date ? new Date(m.release_date).getFullYear() : 0,
        rating: m.vote_average || 0,
        vote_count: m.vote_count || 0,
        poster: `https://image.tmdb.org/t/p/w500${m.poster_path}`,
        genre: "Drama",
      }))
      .sort((a: FilmographyItem, b: FilmographyItem) => b.year - a.year);

    // Process awards (Background fetch OMDb)
    let awards: ActorAward[] = [];

    // Optimization: Skip expensive OMDb calls for list views
    if (!options?.skipAwards) {
      // Reduce limit from 8 to 5 for performance
      const topMovies = [...filmography]
        .sort((a: any, b: any) => b.vote_count - a.vote_count)
        .slice(0, 5);

      awards = await fetchActorAwards(topMovies);
    }

    // Final Strict Check: Must have awards (Only if we checked for them)
    if (options?.strict && !options?.skipAwards && awards.length === 0) {
      // console.log(`[Skipped] ${details.name} (ID: ${id}) - No Awards`);
      return null;
    }

    return {
      id: details.id,
      name: details.name,
      biography: details.biography || "No biography available.",
      birthDate: details.birthday || "Unknown",
      birthPlace: details.place_of_birth || "Unknown",
      image: details.profile_path
        ? `https://image.tmdb.org/t/p/w500${details.profile_path}`
        : "/placeholder-actor.svg",
      coverImage: details.profile_path
        ? `https://image.tmdb.org/t/p/original${details.profile_path}`
        : "/placeholder-backdrop.jpg",
      filmography: filmography,
      awards: awards,
      social: {
        instagram: details.external_ids?.instagram_id ? `https://instagram.com/${details.external_ids.instagram_id}` : "",
        twitter: details.external_ids?.twitter_id ? `https://twitter.com/${details.external_ids.twitter_id}` : "",
        imdb: details.imdb_id ? `https://www.imdb.com/name/${details.imdb_id}/` : "",
      },
      similarActors: [], // Fetched via parallel route or separate call
    };
  } catch (error) {
    console.error(`[ActorDebug] CRITICAL ERROR fetching actor ${id}:`, error);
    return null;
  }
}

async function fetchActorAwards(movies: FilmographyItem[]): Promise<ActorAward[]> {
  const awardsList: ActorAward[] = [];
  const processedAwards = new Set<string>();

  // PARALLELIZE: Fetch all OMDb awards in parallel instead of sequentially
  // We limit concurrency by only picking top 5 movies above.
  const promises = movies.map(async (movie) => {
    try {
      const movieDetails = await tmdbService.getMovieExternalIds(movie.id);
      if (!movieDetails?.imdb_id) return;

      const awardsStr = await getMovieAwards(movieDetails.imdb_id);
      if (!awardsStr || awardsStr === "N/A" || awardsStr.includes("No awards")) return;

      return { movie, awardsStr };
    } catch (e) {
      return null;
    }
  });

  const results = await Promise.all(promises);

  for (const res of results) {
    if (!res) continue;

    const { movie, awardsStr: aStr } = res;
    const mTitle = movie.title;
    const mYear = movie.year;

    const AWARD_KEYWORDS = [
      { key: "Oscar", label: "Academy Awards" },
      { key: "Golden Globe", label: "Golden Globe Awards" },
      { key: "BAFTA", label: "BAFTA Awards" },
      { key: "Emmy", label: "Primetime Emmy Awards" },
      { key: "Cannes", label: "Cannes Film Festival" },
      { key: "Venice", label: "Venice Film Festival" },
      { key: "Berlin", label: "Berlin Film Festival" },
      { key: "Saturn", label: "Saturn Awards" },
      { key: "MTV", label: "MTV Movie Awards" },
      { key: "Hong Kong", label: "Hong Kong Film Awards" },
      { key: "Golden Horse", label: "Golden Horse Awards" },
      { key: "Screen Actors Guild", label: "SAG Awards" },
      { key: "Critics", label: "Critics Choice Awards" },
      { key: "People's Choice", label: "People's Choice Awards" },
      { key: "Teen Choice", label: "Teen Choice Awards" },
      { key: "Annie", label: "Annie Awards" },
    ];

    let foundSpecific = false;
    AWARD_KEYWORDS.forEach(({ key, label }) => {
      if (aStr.includes(key)) {
        foundSpecific = true;
        const isWinText = aStr.match(new RegExp(`Won \\d+ ${key}`, 'i'));
        const finalCategory = isWinText ? "Winner" : "Nominee";
        const finalIsWin = !!isWinText;
        const uniqueId = `${label}-${mYear}-${mTitle}`;
        if (!processedAwards.has(uniqueId)) {
          awardsList.push({
            name: label,
            category: finalCategory,
            year: mYear,
            film: mTitle,
            isWinner: finalIsWin
          });
          processedAwards.add(uniqueId);
        }
      }
    });

    if (!foundSpecific) {
      const winsMatch = aStr.match(/(\d+) win/i);
      const nomsMatch = aStr.match(/(\d+) nomination/i);
      const wins = winsMatch ? parseInt(winsMatch[1]) : 0;
      const noms = nomsMatch ? parseInt(nomsMatch[1]) : 0;

      if (wins > 0 || noms > 0) {
        const summaryName = wins > 0 ? "International & Festival Awards" : "Award Nominations";
        awardsList.push({
          name: summaryName,
          category: `${wins} Wins, ${noms} Nominations`,
          year: mYear,
          film: mTitle,
          isWinner: wins > 0
        });
      }
    }
  }

  return awardsList.sort((a, b) => b.year - a.year);
}

export async function getActorFilmography(
  actorId: number,
  filters?: { year?: number; role?: string }
): Promise<FilmographyItem[]> {
  const actor = await getActorById(actorId);
  let filmography = actor?.filmography || [];

  if (filters) {
    if (filters.year) {
      filmography = filmography.filter((f) => f.year === filters.year);
    }
    if (filters.role) {
      const roleFilter = filters.role.toLowerCase();
      filmography = filmography.filter((f) => f.role.toLowerCase().includes(roleFilter));
    }
  }

  return filmography;
}
