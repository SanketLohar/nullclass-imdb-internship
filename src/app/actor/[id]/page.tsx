import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getActorById } from "@/data/actors/actor.service";
import { tmdbService } from "@/lib/tmdb/tmdb.service";
import {
  Award,
  Instagram,
  Star,
  Twitter,
} from "lucide-react";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const actorId = Number(id);

  // Reuse the logic (ideally refactor to service, but for now duplicate the robust fetch)
  // Or just fetch basic info for metadata
  const person = await tmdbService.getActorDetails(actorId).catch(() => null);

  if (!person) {
    return { title: "Actor Not Found - MovieDB" };
  }

  return {
    title: `${person.name} - MovieDB`,
    description: person.biography?.slice(0, 160) || `Learn more about ${person.name}`,
  };
}

export default async function ActorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const actorId = Number(id);

  // Use the robust service (which handles TMDB + OMDb awards + Socials correctly)
  const serviceActor = await getActorById(actorId);

  if (!serviceActor) {
    notFound();
  }

  // Transform service actor to match page expected structure (if needed)
  // Actually, let's just use the service actor data directly or map it if strictly typed differently
  // The service returns `Actor` type. Let's see what the page uses.
  // The page seems to use a loose object structure. We can map it easily.

  const actor = {
    id: serviceActor.id,
    name: serviceActor.name,
    birthDate: serviceActor.birthDate,
    birthPlace: serviceActor.birthPlace,
    biography: serviceActor.biography,
    image: serviceActor.image,
    coverImage: serviceActor.coverImage,
    knownFor: serviceActor.filmography?.slice(0, 6).map((f) => ({
      id: f.id,
      title: f.title,
      role: f.role,
      year: f.year,
      rating: f.rating,
      image: f.poster,
    })) || [],
    stats: {
      moviesCount: serviceActor.filmography?.length || 0,
      totalAwards: serviceActor.awards?.length || 0,
      avgRating: 8.0, // Placeholder or calculate
      yearsActive: "Active",
    },
    awards: serviceActor.awards || [],
    socialMedia: serviceActor.social || {
      instagram: "#",
      twitter: "#",
      imdb: "#",
    },
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cover */}
      <div className="relative h-[420px] rounded-xl overflow-hidden mb-8">
        <div className="absolute inset-0 bg-zinc-900">
          <Image
            src={actor.image}
            alt={actor.name}
            fill
            priority
            className="object-cover object-top opacity-40 blur-3xl scale-110"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />

        <div className="relative h-full flex items-end pb-8 px-6">
          <div className="flex items-end gap-8">
            <Image
              src={actor.image}
              alt={actor.name}
              width={180}
              height={180}
              className="rounded-xl border-4 border-black object-cover"
            />

            <div>
              <h1 className="text-4xl font-bold mb-3">
                {actor.name}
              </h1>

              <div className="flex gap-6">
                <Stat icon={<Star />} text={`${actor.stats.avgRating.toFixed(1)} Rating`} />
                {actor.stats.totalAwards > 0 && (
                  <Stat
                    icon={<Award />}
                    text={`${actor.stats.totalAwards} Awards`}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Sidebar */}
        <aside className="space-y-6 sticky top-24">
          <div className="bg-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">
              Personal Info
            </h3>
            <Info label="Born" value={actor.birthDate} />
            <Info
              label="Birthplace"
              value={actor.birthPlace}
            />
            <Info
              label="Movies"
              value={`${actor.stats.moviesCount}`}
            />
          </div>

          {(actor.socialMedia.instagram || actor.socialMedia.twitter || actor.socialMedia.imdb) && (
            <div className="bg-zinc-800 rounded-xl p-6">
              <h3 className="font-semibold mb-4">
                Social
              </h3>
              <div className="flex gap-4">
                {actor.socialMedia.instagram && (
                  <a href={actor.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                    <Instagram />
                  </a>
                )}
                {actor.socialMedia.twitter && (
                  <a href={actor.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                    <Twitter />
                  </a>
                )}
                {actor.socialMedia.imdb && (
                  <a href={actor.socialMedia.imdb} target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 transition-colors">
                    IMDb
                  </a>
                )}
              </div>
            </div>
          )}
        </aside>

        {/* Main */}
        <main className="md:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4">
              Biography
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              {actor.biography}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">
              Known For
            </h2>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {actor.knownFor.map((movie) => (
                <Link
                  key={movie.id}
                  href={`/movies/${movie.id}`}
                  className="bg-zinc-800 rounded-lg overflow-hidden hover:scale-105 transition-transform"
                >
                  <div className="relative aspect-[2/3]">
                    <Image
                      src={movie.image}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute top-3 right-3 bg-black/70 px-2 py-1 rounded-md flex gap-1 text-yellow-500 text-sm">
                      <Star className="w-4 h-4 fill-current" />
                      {movie.rating}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-semibold">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      as {movie.role}
                    </p>
                    <p className="text-xs text-zinc-500">
                      {movie.year}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

/* ---------- helpers ---------- */

function Stat({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm bg-black/50 px-3 py-1.5 rounded-full">
      {icon}
      {text}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="mb-3">
      <p className="text-zinc-400 text-sm">{label}</p>
      <p>{value}</p>
    </div>
  );
}
