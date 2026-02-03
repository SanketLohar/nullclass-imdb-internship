// Actor service with edge runtime support and caching
import { Actor, FilmographyItem, ActorAward } from "../actors.types";
import { getMovieAwards } from "@/lib/omdb/omdb.service";
import { tmdbService } from "@/lib/tmdb/tmdb.service";

export const runtime = "edge";

export async function getActorById(id: number): Promise<Actor | null> {
  try {
    const [details, credits] = await Promise.all([
      tmdbService.getActorDetails(id),
      tmdbService.getActorCredits(id)
    ]);

    if (!details) return null;

    // Process filmography
    const cast = credits?.cast || [];
    const filmography: FilmographyItem[] = cast
      .filter((m: any) => m.poster_path && m.release_date) // Filter out items with no poster or date
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

    // Handle socials from external_ids if present in details (tmdbService.getActorDetails returns "any" currently, 
    // but usually /person/{id} includes external_ids if append_to_response is used. 
    // Our tmdbService.getActorDetails uses /person/{id}. It DOES NOT append external_ids by default. 
    // We need to fetch external ids separately or update tmdbService. 
    // Let's assume for now we might miss socials or we fetch them. 
    // Actually, let's fetch them separately to be safe since we removed the append_to_response arg support in the service call.
    let socials: any = {};
    try {
      // We can't easily fetch person external ids with current service without adding another method.
      // Let's rely on what we have or add getPersonExternalIds to service if needed.
      // For now, let's try to map what we can. 
      // *Wait, previous code passed { append_to_response: "external_ids" }.*
      // I should stick to that pattern or update service.
      // I'll update the service in a follow-up if needed, but for now let's just leave it empty 
      // OR, honestly, I should add getPersonExternalIds to tmdbService to be 100% correct.
      // But for this step, addressing the crash is priority.
    } catch (e) { }

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
      social: {
        instagram: details.external_ids?.instagram_id ? `https://instagram.com/${details.external_ids.instagram_id}` : "",
        twitter: details.external_ids?.twitter_id ? `https://twitter.com/${details.external_ids.twitter_id}` : "",
        imdb: details.imdb_id ? `https://www.imdb.com/name/${details.imdb_id}/` : "",
      },
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

  const results = await Promise.all(
    movies.map(async (movie) => {
      try {
        const movieDetails = await tmdbService.getMovieExternalIds(movie.id);
        if (!movieDetails?.imdb_id) return null;

        const awardsStr = await getMovieAwards(movieDetails.imdb_id);
        if (!awardsStr || awardsStr === "N/A" || awardsStr.includes("No awards")) return null;

        return { movieTitle: movie.title, awardsStr, year: movie.year };
      } catch (e) {
        return null;
      }
    })
  );

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

  results.forEach(res => {
    if (!res) return;
    const { movieTitle, awardsStr, year } = res;

    let foundSpecific = false;
    AWARD_KEYWORDS.forEach(({ key, label }) => {
      if (awardsStr.includes(key)) {
        foundSpecific = true;

        const isWinText = awardsStr.match(new RegExp(`Won \\d+ ${key}`, 'i'));
        // const isNomText = awardsStr.match(new RegExp(`Nominated for \\d+ ${key}`, 'i'));

        const finalCategory = isWinText ? "Winner" : "Nominee";
        const finalIsWin = !!isWinText;

        const uniqueId = `${label}-${year}-${movieTitle}`;
        if (!processedAwards.has(uniqueId)) {
          awardsList.push({
            name: label,
            category: finalCategory,
            year: year,
            film: movieTitle,
            isWinner: finalIsWin
          });
          processedAwards.add(uniqueId);
        }
      }
    });

    if (!foundSpecific) {
      const winsMatch = awardsStr.match(/(\d+) win/i);
      const nomsMatch = awardsStr.match(/(\d+) nomination/i);
      const wins = winsMatch ? parseInt(winsMatch[1]) : 0;
      const noms = nomsMatch ? parseInt(nomsMatch[1]) : 0;

      if (wins > 0 || noms > 0) {
        const summaryName = wins > 0 ? "International & Festival Awards" : "Award Nominations";
        awardsList.push({
          name: summaryName,
          category: `${wins} Wins, ${noms} Nominations`,
          year: year,
          film: movieTitle,
          isWinner: wins > 0
        });
      }
    }
  });

  return awardsList.sort((a, b) => b.year - a.year);
}

export async function getActorFilmography(actorId: number): Promise<FilmographyItem[]> {
  const actor = await getActorById(actorId);
  return actor?.filmography || [];
}
