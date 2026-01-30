import { ACTORS } from "@/data/actors";

export default async function BioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const actor =
    ACTORS.find((a) => a.id === Number(id)) ??
    ACTORS[0];

  return (
    <section className="bg-zinc-900/60 rounded-xl p-6">
      <h2 className="text-xl font-semibold mb-4">
        Biography
      </h2>

      <p className="text-neutral-300 leading-relaxed">
        {actor.biography}
      </p>
    </section>
  );
}
