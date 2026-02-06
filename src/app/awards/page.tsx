import { Award, Trophy, Star } from "lucide-react";
import Link from "next/link";
import OfflineBoundary from "@/components/system/OfflineBoundary";

export default function AwardsPage() {
  const awardsData = [
    {
      organization: "Academy Awards",
      year: 2024,
      categories: [
        {
          name: "Best Picture",
          winner: { title: "Oppenheimer", director: "Christopher Nolan" },
          nominees: ["Barbie", "Killers of the Flower Moon", "Poor Things", "The Holdovers"],
        },
        {
          name: "Best Actor",
          winner: { name: "Cillian Murphy", film: "Oppenheimer" },
          nominees: ["Bradley Cooper", "Colman Domingo", "Paul Giamatti", "Jeffrey Wright"],
        },
        {
          name: "Best Actress",
          winner: { name: "Emma Stone", film: "Poor Things" },
          nominees: ["Annette Bening", "Lily Gladstone", "Sandra Hüller", "Carey Mulligan"],
        },
      ],
    },
    {
      organization: "Golden Globe Awards",
      year: 2024,
      categories: [
        {
          name: "Best Motion Picture - Drama",
          winner: { title: "Oppenheimer", director: "Christopher Nolan" },
          nominees: ["Killers of the Flower Moon", "Maestro", "Past Lives", "The Zone of Interest"],
        },
        {
          name: "Best Motion Picture - Musical or Comedy",
          winner: { title: "Poor Things", director: "Yorgos Lanthimos" },
          nominees: ["Air", "American Fiction", "Barbie", "The Holdovers", "May December"],
        },
      ],
    },
    {
      organization: "Cannes Film Festival",
      year: 2023,
      categories: [
        {
          name: "Palme d'Or",
          winner: { title: "Anatomy of a Fall", director: "Justine Triet" },
          nominees: ["The Zone of Interest", "Monster", "Fallen Leaves", "Asteroid City"],
        },
      ],
    },
  ];

  return (
    <OfflineBoundary>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Trophy className="w-8 h-8 text-yellow-500" />
          <h1 className="text-4xl font-bold">Awards & Nominations</h1>
        </div>

        <div className="space-y-12">
          {awardsData.map((awardGroup) => (
            <section key={awardGroup.organization} className="bg-card/50 rounded-2xl p-8 border border-border">
              <div className="flex items-baseline gap-4 mb-8 border-b border-border pb-4">
                <h2 className="text-3xl font-bold text-foreground">{awardGroup.organization}</h2>
                <span className="text-xl text-muted-foreground">{awardGroup.year}</span>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {awardGroup.categories.map((category) => (
                  <div key={category.name} className="flex flex-col">
                    <h3 className="text-lg font-semibold text-yellow-500 mb-4 flex items-center gap-2">
                      <Award className="w-5 h-5" />
                      {category.name}
                    </h3>

                    {/* Winner Card */}
                    <div className="bg-card rounded-xl p-4 border border-yellow-500/30 shadow-lg shadow-yellow-500/5 mb-4 relative overflow-hidden group">
                      <div className="absolute top-0 right-0 bg-yellow-500 text-black text-xs font-bold px-2 py-1 rounded-bl-lg z-10">
                        WINNER
                      </div>
                      <div className="relative z-10">
                        <p className="text-xl font-bold text-foreground mb-1">
                          {'title' in category.winner ? category.winner.title : category.winner.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {'director' in category.winner ? category.winner.director : category.winner.film}
                        </p>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Nominees */}
                    <div className="flex-1 bg-muted/30 rounded-xl p-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Nominees
                      </h4>
                      <ul className="space-y-2">
                        {category.nominees.map((nominee) => (
                          <li key={nominee} className="flex items-center gap-2 text-foreground/80 text-sm">
                            <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground" />
                            {nominee}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </OfflineBoundary>
  );
}
