import { Suspense } from "react";
import Image from "next/image";
import { getActorById } from "@/data/actors/actor.service";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getLocaleFromHeaders, getActorName, getActorBiography, getAlternateNames } from "@/lib/i18n/actor-i18n";

// ISR configuration - revalidate every hour, with stale-while-revalidate
export const revalidate = 3600; // Revalidate every hour
export const dynamic = "force-static";
export const dynamicParams = true;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const actor = await getActorById(Number(id));

  if (!actor) {
    return {
      title: "Actor Not Found",
    };
  }

  const headersList = await headers();
  const locale = getLocaleFromHeaders(headersList);
  const localizedName = getActorName(actor, locale);
  const localizedBio = getActorBiography(actor, locale);

  return {
    title: `${localizedName} | Actor Profile`,
    description: localizedBio,
    openGraph: {
      title: localizedName,
      description: localizedBio,
      images: [actor.image],
    },
    // Resource hints for LCP optimization
    other: {
      "preconnect": "https://images.unsplash.com",
      "dns-prefetch": "https://images.unsplash.com",
    },
  };
}

export default async function ActorLayout({
  params,
  bio,
  awards,
  social,
  knownfor,
  similar,
  cast,
  overview,
}: {
  params: Promise<{ id: string }>;
  bio: React.ReactNode;
  awards: React.ReactNode;
  social: React.ReactNode;
  knownfor: React.ReactNode;
  similar: React.ReactNode;
  cast: React.ReactNode;
  overview: React.ReactNode;
}) {
  const { id } = await params;
  const actorId = Number(id);

  let actor = null;

  // Fetch Actor Data
  // Optimization: getActorById handles TMDB fetching, caching, and normalization internally.
  // We use this single source of truth to ensure the Layout (Header) matches the sub-pages.
  actor = await getActorById(actorId, { strict: false }); // Hero rendering doesn't need strict checks


  // Fallback
  if (!actor) {
    actor = await getActorById(actorId);
  }

  if (!actor) {
    notFound();
  }

  // Get locale for i18n
  const headersList = await headers();
  const locale = getLocaleFromHeaders(headersList);
  // Note: getActorName/Bio helpers might need adjustment if they rely on specific mock structure, 
  // but we are mocking the structure to match.
  const localizedName = actor.name; // Simplification for now
  const localizedBio = actor.biography;
  const alternateNames: string[] = []; // Skipping for TMDB data for now

  // Generate JSON-LD structured data with i18n
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: localizedName,
    alternateName: alternateNames,
    birthDate: actor.birthDate,
    birthPlace: actor.birthPlace,
    description: localizedBio,
    image: actor.image,
    sameAs: [
      actor.social.instagram,
      actor.social.twitter,
      actor.social.imdb,
    ].filter(Boolean),
    award: actor.awards.map((award: any) => ({
      "@type": "Award",
      name: award.name,
      dateReceived: award.year.toString(),
    })),
    inLanguage: locale,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        {/* HERO */}
        {/* HERO */}
        <div className="relative h-auto md:h-[320px] rounded-xl overflow-hidden mb-8 md:mb-12 bg-zinc-900 border border-zinc-800">
          {/* Abstract Background (Spotify Style) */}
          <div className="absolute inset-0 overflow-hidden">
            <Image
              src={actor.image || "/placeholder-actor.svg"}
              alt={localizedName || actor?.name || "Actor Background"}
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover object-top opacity-50 blur-3xl scale-125 saturate-150"
              quality={60}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent" />
          </div>

          <div className="relative h-full flex items-end pb-6 md:pb-8 px-4 md:px-6 z-10 pt-6 md:pt-0">
            <div className="flex flex-col md:flex-row gap-4 md:gap-8 items-center md:items-end w-full md:w-auto text-center md:text-left">
              <Image
                src={actor.image || "/placeholder-actor.svg"}
                alt={localizedName || actor?.name || "Actor Profile"}
                width={180}
                height={180}
                className="rounded-xl border-4 border-zinc-950 shadow-2xl object-cover bg-zinc-800 w-[120px] h-[120px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px]"
                priority
                fetchPriority="high"
                sizes="(max-width: 768px) 140px, 180px"
              />
              <div className="pb-2">
                <h1 className="text-2xl sm:text-3xl md:text-5xl font-bold text-white drop-shadow-md leading-tight">
                  {localizedName}
                </h1>
                {alternateNames.length > 0 && (
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1 md:mt-2 font-medium">
                    Also known as: {alternateNames.join(", ")}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* TOP PANELS */}
        <section className="grid md:grid-cols-3 gap-6 mb-16">
          {bio}
          {awards}
          {social}
        </section>

        {/* FILMOGRAPHY */}
        <section className="mb-20">
          {knownfor}
        </section>

        {/* SIMILAR ACTORS */}
        <section>
          <Suspense fallback={null} key={`similar-${actorId}`}>
            {similar}
          </Suspense>
        </section>
      </div>
    </>
  );
}
