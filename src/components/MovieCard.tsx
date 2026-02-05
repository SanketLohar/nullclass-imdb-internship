"use client";

import { Star } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";

type Props = {
  id: number;
  title: string;
  rating: number;
  image: string;
  posterUrl?: string; // New prop
  year: number;
  genre: string[];
};

import WatchlistButton from "./WatchlistButton";

export default function MovieCard({
  id,
  title,
  rating,
  image,
  posterUrl,
  year,
  genre,
}: Props) {
  /* Fallback Image Logic */
  const [imgSrc, setImgSrc] = useState(posterUrl || image);

  useEffect(() => {
    setImgSrc(posterUrl || image);
  }, [posterUrl, image]);

  return (
    <div className="bg-card rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300 group relative flex flex-col h-full border border-border shadow-sm">
      <div className="relative aspect-[2/3] w-full bg-muted">
        <Image
          src={imgSrc}
          alt={title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
          onError={() => setImgSrc("/placeholder-movie.jpg")}
        />
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <WatchlistButton
            movie={{
              id,
              title,
              posterUrl: image,
              releaseYear: year,
              rating,
            }}
          />
        </div>
      </div>

      <div className="p-3">
        <h3 className="font-semibold text-card-foreground truncate">
          {title}
        </h3>

        <div className="flex items-center gap-1 text-sm text-yellow-700">
          <Star className="w-4 h-4 fill-current" aria-hidden="true" />
          {rating.toFixed(1)}
        </div>

        <p className="text-xs text-muted-foreground mt-1">
          {year} • {genre && genre[0]}
        </p>
      </div>
    </div>
  );
}
