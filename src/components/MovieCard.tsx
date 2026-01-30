"use client";

import { Star } from "lucide-react";
import Image from "next/image";

type Props = {
  id: number;
  title: string;
  rating: number;
  image: string;
  year: number;
  genre: string[];
};

export default function MovieCard({
  title,
  rating,
  image,
  year,
  genre,
}: Props) {
  return (
    <div className="bg-zinc-900 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300">
      <div className="relative h-[300px]">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover"
        />
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-white truncate">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-sm text-yellow-400">
          <Star className="w-4 h-4 fill-current" />
          {rating}
        </div>

        <p className="text-xs text-zinc-400 mt-1">
          {year} • {genre[0]}
        </p>
      </div>
    </div>
  );
}
