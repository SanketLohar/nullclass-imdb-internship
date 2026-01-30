import { ACTORS } from "@/data/actors";

export default async function AwardsPage({
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
        Awards & Nominations
      </h2>

      <ul className="space-y-3">
        {actor.awards.map((award, i) => (
          <li
            key={i}
            className="flex justify-between border-b border-white/10 pb-2"
          >
            <span>{award.name}</span>
            <span className="text-neutral-400">
              {award.year}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}
