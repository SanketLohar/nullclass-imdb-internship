import { tmdbService } from "@/lib/tmdb/tmdb.service";
import Link from "next/link";
import Image from "next/image";
import ActorCard from "@/components/actors/ActorCard.client";

export default async function ActorsPage() {
    let actors: any[] = [];

    if (process.env.NEXT_PUBLIC_TMDB_API_KEY) {
        try {
            // Fetch more pages to ensure we have enough candidates
            // We need a large pool because strict validation (Bio + Awards) drops many
            const pages = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
            const responses = await Promise.all(pages.map(p => tmdbService.getPopularActors(p)));
            const allCandidates = responses.flatMap(r => r?.results || []);

            // Remove duplicates just in case
            const seen = new Set();
            const uniqueCandidates = allCandidates.filter(c => {
                const duplicate = seen.has(c.id);
                seen.add(c.id);
                return !duplicate;
            });

            // "Fill the Bucket" Strategy
            // Process candidates in small batches to avoid Rate Limiting (OMDb/TMDB)
            // Stop once we have enough valid actors (Target: 24)
            const TARGET_COUNT = 24;
            const BATCH_SIZE = 5;
            const validActors: any[] = [];

            // Import service dynamically
            const { getActorById } = await import("@/data/actors/actor.service");

            for (let i = 0; i < uniqueCandidates.length; i += BATCH_SIZE) {
                if (validActors.length >= TARGET_COUNT) break;

                const batch = uniqueCandidates.slice(i, i + BATCH_SIZE);

                const batchResults = await Promise.all(
                    batch.map(async (candidate: any) => {
                        // Quick pre-filter
                        if (candidate.name === "John Leonidas" || !candidate.profile_path || candidate.popularity < 10) return null;

                        try {
                            // Strict Mode: Service handles Bio/IMDb/Awards validation internally
                            const detailedActor = await getActorById(candidate.id, { strict: true });

                            if (detailedActor) {
                                return {
                                    id: detailedActor.id,
                                    name: detailedActor.name,
                                    image: detailedActor.image,
                                    popularity: candidate.popularity,
                                    knownFor: detailedActor.filmography.slice(0, 3).map(f => f.title).join(", ")
                                };
                            }
                        } catch (e) {
                            return null;
                        }
                        return null;
                    })
                );

                const validBatch = batchResults.filter(a => a !== null);
                validActors.push(...validBatch);
            }

            actors = validActors;
        } catch (e) {
            console.error("Failed to fetch popular actors", e);
        }
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Popular Actors</h1>

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
        </div>
    );
}
