import { tmdbService } from "@/lib/tmdb/tmdb.service";
import Link from "next/link";
import Image from "next/image";
import ActorCard from "@/components/actors/ActorCard.client";

export default async function ActorsPage() {
    let actors: any[] = [];

    if (process.env.NEXT_PUBLIC_TMDB_API_KEY) {
        try {
            const response = await tmdbService.getPopularActors();
            const config = await tmdbService.getConfig();
            actors = response.results
                .filter((person: any) =>
                    person.name !== "John Leonidas" && // Remove invalid actor
                    person.profile_path &&             // Must have profile image
                    person.popularity >= 20            // Must be globally popular
                )
                .map((person) => ({
                    id: person.id,
                    name: person.name,
                    image: person.profile_path
                        ? `${config.images.secure_base_url}w780${person.profile_path}`
                        : "/placeholder-actor.jpg",
                    popularity: person.popularity,
                    knownFor: person.known_for?.map((media: any) => media.title || media.name).join(", ")
                }));
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
