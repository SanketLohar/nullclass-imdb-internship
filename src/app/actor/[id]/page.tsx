"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Instagram,
  Star,
  Twitter,
} from "lucide-react";

type Actor = {
  id: number;
  name: string;
  birthDate: string;
  birthPlace: string;
  nationality: string;
  height: string;
  biography: string;
  image: string;
  coverImage: string;
  awards: {
    name: string;
    year: number;
    category: string;
    film: string;
  }[];
  socialMedia: {
    instagram: string;
    twitter: string;
    imdb: string;
  };
  knownFor: {
    id: number;
    title: string;
    role: string;
    year: number;
    rating: number;
    image: string;
  }[];
  stats: {
    moviesCount: number;
    totalAwards: number;
    avgRating: number;
    yearsActive: string;
  };
};

const ACTORS: Actor[] = [
  {
    id: 1,
    name: "Timothée Chalamet",
    birthDate: "December 27, 1995",
    birthPlace: "New York City, USA",
    nationality: "American–French",
    height: "5'10\"",
    biography:
      "Timothée Hal Chalamet is an American actor known for his emotionally complex performances and global popularity.",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
    coverImage:
      "https://images.unsplash.com/photo-1492446845049-9c50cc313f00?auto=format&fit=crop&w=2000&q=80",
    awards: [
      {
        name: "Academy Award Nomination",
        year: 2018,
        category: "Best Actor",
        film: "Call Me by Your Name",
      },
      {
        name: "Golden Globe Nomination",
        year: 2018,
        category: "Best Actor - Drama",
        film: "Call Me by Your Name",
      },
    ],
    socialMedia: {
      instagram: "https://instagram.com/tchalamet",
      twitter: "https://twitter.com/realchalamet",
      imdb: "https://www.imdb.com/name/nm3154303/",
    },
    knownFor: [
      {
        id: 1,
        title: "Dune: Part Two",
        role: "Paul Atreides",
        year: 2024,
        rating: 8.8,
        image:
          "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=800&q=80",
      },
      {
        id: 2,
        title: "Wonka",
        role: "Willy Wonka",
        year: 2023,
        rating: 7.2,
        image:
          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80",
      },
    ],
    stats: {
      moviesCount: 18,
      totalAwards: 12,
      avgRating: 8.4,
      yearsActive: "2012–present",
    },
  },
];

export default function ActorPage({
  params,
}: {
  params: { id: string };
}) {
  const actor =
    ACTORS.find((a) => a.id === Number(params.id)) ||
    ACTORS[0];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Cover */}
      <div className="relative h-[420px] rounded-xl overflow-hidden mb-8">
        <Image
          src={actor.coverImage}
          alt={actor.name}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90" />

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
                <Stat icon={<Star />} text={`${actor.stats.avgRating} Rating`} />
                <Stat
                  icon={<Award />}
                  text={`${actor.stats.totalAwards} Awards`}
                />
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

          <div className="bg-zinc-800 rounded-xl p-6">
            <h3 className="font-semibold mb-4">
              Social
            </h3>
            <div className="flex gap-4">
              <a href={actor.socialMedia.instagram}>
                <Instagram />
              </a>
              <a href={actor.socialMedia.twitter}>
                <Twitter />
              </a>
            </div>
          </div>
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
