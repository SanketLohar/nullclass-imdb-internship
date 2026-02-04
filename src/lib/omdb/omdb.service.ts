// src/lib/omdb/omdb.service.ts

type OMDbResponse = {
    Response: "True" | "False";
    Awards?: string;
    Error?: string;
};

const OMDB_BASE_URL = "https://www.omdbapi.com/";

// 🔒 In-memory cache to prevent duplicate calls
// Keyed by IMDb ID
const awardsCache = new Map<string, string>();

/**
 * Fetch movie awards from OMDb using IMDb ID.
 * Results are cached per IMDb ID to prevent duplicate network calls.
 */
export async function getMovieAwards(imdbId: string): Promise<string> {
    const apiKey = process.env.NEXT_PUBLIC_OMDB_API_KEY;

    if (!apiKey || !imdbId) {
        return "No awards information available.";
    }

    // ✅ Return cached value if available
    if (awardsCache.has(imdbId)) {
        return awardsCache.get(imdbId)!;
    }

    try {
        console.log(
            `[OMDb] Fetching awards for ${imdbId} with key ending in ...${apiKey.slice(
                -4
            )}`
        );

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

        const response = await fetch(
            `${OMDB_BASE_URL}?apikey=${apiKey}&i=${imdbId}`,
            {
                // Next.js optimization
                cache: "force-cache",
                signal: controller.signal,
            }
        ).finally(() => clearTimeout(timeoutId));

        if (!response.ok) {
            throw new Error(`OMDb HTTP error ${response.status}`);
        }

        const data = (await response.json()) as OMDbResponse;

        const awards =
            data.Response === "True" &&
                data.Awards &&
                data.Awards.trim() !== "" &&
                data.Awards !== "N/A"
                ? data.Awards
                : "No awards information available.";

        // ✅ Cache result (including fallback)
        awardsCache.set(imdbId, awards);

        return awards;
    } catch (error: any) {
        if (error.name === "AbortError") {
            console.warn(`[OMDb] Request timed out for ${imdbId} after 8s`);
        } else {
            console.error("[OMDb] API error:", error);
        }

        const fallback = "No awards information available.";
        awardsCache.set(imdbId, fallback);
        return fallback;
    }
}

/**
 * Optional helper if you want to clear cache (dev/debug only)
 */
export function clearOmdbAwardsCache() {
    awardsCache.clear();
}
