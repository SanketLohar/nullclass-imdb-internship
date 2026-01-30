"use client";

import {
  Award,
  BarChart3,
  Calendar,
  Clock,
  DollarSign,
  Globe,
  Heart,
  Play,
  Share2,
  Star,
} from "lucide-react";

import Image from "next/image";
import Link from "next/link";

type Cast = {
  id: number;
  name: string;
  role: string;
  image: string;
  bio: string;
};

type Movie = {
  id: number;
  title: string;
  rating: number;
  year: number;
  duration: string;
  genre: string[];
  director: string;
  description: string;
  image: string;
  backdrop: string;
  cast: Cast[];
  trailer: string;
  awards: string[];
  boxOffice: string;
  language: string;
  productionCompany: string;
  releaseDate: string;
  metacriticScore: number;
  rottenTomatoesScore: number;
};

const MOVIES: Movie[] = [
  {
    id: 1,
    title: "Dune: Part Two",
    rating: 8.8,
    year: 2024,
    duration: "166 min",
    genre: ["Action", "Adventure", "Drama", "Sci-Fi"],
    director: "Denis Villeneuve",
    description:
      "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    image:
      "https://images.unsplash.com/photo-1534809027769-b00d750a6bac?auto=format&fit=crop&w=800&q=80",
    backdrop:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=2000&q=80",
    cast: [
      {
        id: 1,
        name: "Timothée Chalamet",
        role: "Paul Atreides",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
        bio: "Rising star known for compelling performances",
      },
      {
        id: 2,
        name: "Zendaya",
        role: "Chani",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
        bio: "Multi-talented actress and fashion icon",
      },
    ],
    trailer: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    awards: ["Academy Award Nominee", "Golden Globe Nominee"],
    boxOffice: "$494.7M",
    language: "English",
    productionCompany: "Legendary Entertainment",
    releaseDate: "2024-03-01",
    metacriticScore: 81,
    rottenTomatoesScore: 94,
  },
];

export default function MovieDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const movie =
    MOVIES.find((m) => m.id === Number(params.id)) ||
    MOVIES[0];

  return (
    <div>
      {/* Hero */}
      <div className="relative h-[90vh]">
        <Image
          src={movie.backdrop}
          alt={movie.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80" />

        <div className="relative container mx-auto px-4 h-full flex items-end pb-12">
          <div className="grid md:grid-cols-3 gap-8 items-end">
            <div className="hidden md:block">
              <Image
                src={movie.image}
                alt={movie.title}
                width={300}
                height={450}
                className="rounded-lg shadow-xl object-cover"
              />
            </div>

            <div className="md:col-span-2">
              <div className="flex flex-wrap gap-4 mb-4">
                <Badge icon={<Star />} text={`${movie.rating} Rating`} />
                <Badge icon={<Clock />} text={movie.duration} />
                <Badge
                  icon={<Calendar />}
                  text={movie.releaseDate}
                />
              </div>

              <h1 className="text-4xl md:text-6xl font-bold mb-4">
                {movie.title}
              </h1>

              <div className="flex flex-wrap gap-2 mb-6">
                {movie.genre.map((g) => (
                  <span
                    key={g}
                    className="px-3 py-1 bg-zinc-800 rounded-full text-sm"
                  >
                    {g}
                  </span>
                ))}
              </div>

              <div className="flex gap-4 flex-wrap">
                <a
                  href={movie.trailer}
                  target="_blank"
                  className="bg-yellow-500 text-black px-8 py-3 rounded-lg font-semibold flex items-center gap-2"
                >
                  <Play className="w-5 h-5" />
                  Watch Trailer
                </a>

                <button className="bg-zinc-800 px-8 py-3 rounded-lg flex items-center gap-2">
                  <Heart className="w-5 h-5" />
                  Watchlist
                </button>

                <button className="bg-zinc-800 px-4 py-3 rounded-lg">
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-12 grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-12">
          <section>
            <h2 className="text-2xl font-bold mb-4">
              Overview
            </h2>
            <p className="text-zinc-300 leading-relaxed">
              {movie.description}
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold mb-6">
              Top Cast
            </h2>

            <div className="grid grid-cols-2 gap-6">
              {movie.cast.map((actor) => (
                <Link
                  key={actor.id}
                  href={`/actor/${actor.id}`}
                  className="bg-zinc-800/60 rounded-lg p-4 flex gap-4 hover:bg-zinc-700/60"
                >
                  <Image
                    src={actor.image}
                    alt={actor.name}
                    width={96}
                    height={96}
                    className="rounded-xl object-cover"
                  />
                  <div>
                    <h3 className="font-semibold">
                      {actor.name}
                    </h3>
                    <p className="text-sm text-zinc-400">
                      {actor.role}
                    </p>
                    <p className="text-xs text-zinc-400 line-clamp-2">
                      {actor.bio}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="sticky top-24">
          <div className="bg-zinc-800/60 rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-lg">
              Movie Info
            </h3>

            <Info label="Director" value={movie.director} />
            <Info
              label="Production"
              value={movie.productionCompany}
            />
            <Info label="Box Office" value={movie.boxOffice} />
            <Info label="Language" value={movie.language} />
          </div>
        </aside>
      </main>
    </div>
  );
}

/* ---------- helpers ---------- */

function Badge({
  icon,
  text,
}: {
  icon: React.ReactNode;
  text: string;
}) {
  return (
    <div className="flex items-center gap-2 bg-black/60 px-3 py-1.5 rounded-full text-sm">
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
    <div>
      <p className="text-zinc-400 text-sm">{label}</p>
      <p>{value}</p>
    </div>
  );
}
