import { getActorById } from "@/data/actors/actor.service";
import { Award, Trophy } from "lucide-react";
import { ActorAward } from "@/data/actors.types";

export default async function AwardsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actor = await getActorById(Number(id));

  if (!actor) {
    return null;
  }

  // Group awards by organization
  const groupedAwards = (actor.awards || []).reduce((acc, award) => {
    if (!acc[award.name]) {
      acc[award.name] = [];
    }
    acc[award.name].push(award);
    return acc;
  }, {} as Record<string, ActorAward[]>);

  return (
    <section className="bg-card border border-border rounded-xl p-6 h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-accent/10 rounded-lg">
          <Trophy className="w-5 h-5 text-accent" />
        </div>
        <h2 className="text-xl font-bold text-card-foreground">Awards & Nominations</h2>
      </div>

      {Object.keys(groupedAwards).length > 0 ? (
        <div className="space-y-8">
          {Object.entries(groupedAwards).map(([org, awards]) => (
            <div key={org}>
              <h3 className="text-lg font-semibold text-foreground mb-3 border-b border-border pb-2">
                {org}
              </h3>
              <ul className="space-y-4">
                {awards.map((award, i) => (
                  <li
                    key={i}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 group"
                  >
                    <div>
                      <span className="font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                        {award.category}
                      </span>
                      {award.film && (
                        <p className="text-xs text-muted-foreground/70">
                          for <span className="italic">{award.film}</span>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground bg-muted px-2 py-0.5 rounded">
                        {award.year}
                      </span>
                      {award.isWinner ? (
                        <span className="text-xs font-bold text-black bg-yellow-500 px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                          <Trophy className="w-3 h-3" />
                          WINNER
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-muted-foreground border border-border px-2 py-1 rounded-full bg-background/50">
                          NOMINEE
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <Award className="w-12 h-12 mb-3 opacity-20" />
          <p>No awards information available for this actor.</p>
        </div>
      )}
    </section>
  );
}
