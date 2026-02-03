import { getActorById } from "@/data/actors/actor.service";
import { headers } from "next/headers";
import { getLocaleFromHeaders, getActorBiography } from "@/lib/i18n/actor-i18n";

export default async function BioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getActorById(Number(id));

  if (!actor) {
    return null;
  }

  const headersList = await headers();
  const locale = getLocaleFromHeaders(headersList);
  const localizedBio = getActorBiography(actor, locale);

  return (
    <section className="bg-zinc-900/60 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">
        Biography
      </h2>

      <p className="text-neutral-300 leading-relaxed">
        {localizedBio}
      </p>
    </section>
  );
}
