// Actor service with edge runtime support and caching
import { Actor, FilmographyItem, ActorAward } from "../actors.types";
import { getMovieAwards } from "@/lib/omdb/omdb.service";
import { tmdbService } from "@/lib/tmdb/tmdb.service";

export const runtime = "edge";

export async function getActorById(id: number, options?: { strict?: boolean }): Promise<Actor | null> {
  try {
    const [details, credits] = await Promise.all([
      tmdbService.getActorDetails(id),
      tmdbService.getActorCredits(id)
    ]);

    if (!details) return null;

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
    const filmography: FilmographyItem[] = cast
      .filter((m: any) =>
        m.id &&
        m.poster_path &&
        m.release_date &&
        m.vote_average > 0 &&
        m.vote_count > 0 &&
        m.title
      ) // Filter out items with no poster, date, or ratings
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
    const topMovies = [...filmography]
      .sort((a: any, b: any) => b.vote_count - a.vote_count)
      .slice(0, 8);

    const awards = await fetchActorAwards(topMovies);

    // Final Strict Check: Must have awards
    if (options?.strict && awards.length === 0) {
      // console.log(`[Skipped] ${details.name} (ID: ${id}) - No Awards`);
      return null;
    }

    // Handle socials from external_ids
    const socials = {
      instagram: details.external_ids?.instagram_id ? `https://instagram.com/${details.external_ids.instagram_id}` : "",
      twitter: details.external_ids?.twitter_id ? `https://twitter.com/${details.external_ids.twitter_id}` : "",
      imdb: details.imdb_id ? `https://www.imdb.com/name/${details.imdb_id}/` : "",
      facebook: details.external_ids?.facebook_id ? `https://facebook.com/${details.external_ids.facebook_id}` : "",
    };

    return {
      id: details.id,
      name: details.name,
      birthDate: details.birthday || "N/A",
      birthPlace: details.place_of_birth || "N/A",
      biography: details.biography || "",
      image: details.profile_path
        ? `https://image.tmdb.org/t/p/h632${details.profile_path}`
        : "/placeholder-actor.jpg",
      coverImage: filmography[0]?.poster || "/placeholder-backdrop.jpg",
      social: socials,
      awards: awards,
      filmography: filmography,
      similarActors: [],
      i18n: {
        name: { en: details.name },
        biography: { en: details.biography || "" }
      }
    };
  } catch (error) {
    console.error("Error fetching actor:", error);
    return null;
  }
}

async function fetchActorAwards(movies: FilmographyItem[]): Promise<ActorAward[]> {
  const awardsList: ActorAward[] = [];
  const processedAwards = new Set<string>();

  // THROTTLING: Process sequentially to avoid OMDb rate limits causing `fetch failed`
  for (const movie of movies) {
    try {
      const movieDetails = await tmdbService.getMovieExternalIds(movie.id);
      if (!movieDetails?.imdb_id) continue;

      const awardsStr = await getMovieAwards(movieDetails.imdb_id);
      if (!awardsStr || awardsStr === "N/A" || awardsStr.includes("No awards")) continue;

      const res = { movieTitle: movie.title, awardsStr, year: movie.year };

      // --- Process Logic (Same as before) ---
      const { movieTitle: mTitle, awardsStr: aStr, year: mYear } = res;

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
      // --- End Process Logic ---

    } catch (e) {
      // Ignore single movie failure
    }
  }

  return awardsList.sort((a, b) => b.year - a.year);
}

export async function getActorFilmography(actorId: number): Promise<FilmographyItem[]> {
  const actor = await getActorById(actorId);
  return actor?.filmography || [];
}
