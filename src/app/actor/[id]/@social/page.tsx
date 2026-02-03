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
            className="flex items-center gap-2 text-pink-400"
          >
            <Instagram size={18} />
            Instagram
          </a>
        )}

        {actor.social?.twitter && (
          <a
            href={actor.social.twitter}
            target="_blank"
            className="flex items-center gap-2 text-sky-400"
          >
            <Twitter size={18} />
            Twitter
          </a>
        )}

        {actor.social?.imdb && (
          <a
            href={actor.social.imdb}
            target="_blank"
            className="flex items-center gap-2 text-yellow-400"
          >
            <Globe size={18} />
            IMDb
          </a>
        )}
      </div>
    </section>
  );
}
