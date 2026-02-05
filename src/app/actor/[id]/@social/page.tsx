import { getActorById } from "@/data/actors/actor.service";
import { Instagram, Twitter, Globe } from "lucide-react";

export default async function SocialPanel({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getActorById(Number(id));

  if (!actor) {
    return null;
  }

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">
        Social
      </h2>

      <div className="flex gap-4">
        {actor.social?.instagram && (
          <a
            href={actor.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-pink-600 hover:text-pink-700 transition-colors"
          >
            <Instagram size={18} aria-hidden="true" />
            Instagram
          </a>
        )}

        {actor.social?.twitter && (
          <a
            href={actor.social.twitter}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sky-600 hover:text-sky-700 transition-colors"
          >
            <Twitter size={18} aria-hidden="true" />
            Twitter
          </a>
        )}

        {actor.social?.imdb && (
          <a
            href={actor.social.imdb}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-yellow-700 hover:text-yellow-800 transition-colors"
          >
            <Globe size={18} aria-hidden="true" />
            IMDb
          </a>
        )}
      </div>
    </section>
  );
}
