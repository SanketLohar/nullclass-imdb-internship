import { tmdbService } from "@/lib/tmdb/tmdb.service";
import Link from "next/link";
import Image from "next/image";
import ActorCard from "@/components/actors/ActorCard.client";

// Force dynamic rendering to ensure fresh data, but we can cache the API call
export const dynamic = "force-dynamic";

export default async function ActorsPage() {
    // 1. Fetch popular actors (Pages 1-2 is usually enough for 24 high-quality ones)
    // Fetching more pages to improve diversity if needed, but 1-2 is fast.
    const pages = [1, 2, 3];
    const responses = await Promise.all(pages.map(p => tmdbService.getPopularActors(p)));
    const allCandidates = responses.flatMap(r => r?.results || []);

    // 2. Filter & Map DIRECTLY (No N+1 requests)
    const seen = new Set();
    const actors = allCandidates
        .filter(c => {
            // Strict filtering on list view to ensure quality
            if (!c.id || seen.has(c.id)) return false;
            if (!c.name || !c.profile_path) return false;
            // c.known_for is standard in /person/popular
            return true;
        })
        .map(c => {
            seen.add(c.id);
            // Extract known movies
            const knownForText = Array.isArray(c.known_for)
                ? c.known_for
                    .filter((k: any) => k.media_type === "movie" && k.title)
                    .map((k: any) => k.title)
                    .slice(0, 3)
                    .join(", ")
                : "";

            return {
                id: c.id,
                name: c.name,
                image: `https://image.tmdb.org/t/p/w500${c.profile_path}`,
                knownFor: knownForText || "Popular Actor"
            };
        })
        .slice(0, 30); // Show top 30

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Popular Actors</h1>

            {actors.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground">
                    <p className="text-lg">Unable to load actors at this time.</p>
                    <p className="text-sm mt-2 opacity-70">Please check your internet connection and try again.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {actors.map((actor) => (
                        <ActorCard
                            key={actor.id}
                            id={actor.id}
                            name={actor.name}
                            image={actor.image}
                            knownFor={actor.knownFor}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
