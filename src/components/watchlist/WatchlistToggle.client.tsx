"use client";

import { Bookmark, Check } from "lucide-react";
import { useWatchlist } from "@/context/watchlist.context";
import { useAuth } from "@/context/auth/auth.context";
import { useRouter } from "next/navigation";

interface Props {
  movie: {
    id: string;
    title: string;
    posterUrl: string;
    releaseYear: number;
    rating?: number;
  };
}

export default function WatchlistToggle({ movie }: Props) {
  const { toggle, isSaved } = useWatchlist();
  const { user } = useAuth();
  const router = useRouter();

  const saved = isSaved(movie.id);

  const onClick = () => {
    if (!user) {
      router.push("/login?redirect=" + window.location.pathname);
      return;
    }

    toggle({
      id: movie.id,
      title: movie.title,
      posterUrl: movie.posterUrl,
      releaseYear: movie.releaseYear,
      rating: movie.rating,
    });
  };

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition
        ${saved ? "bg-red-500 text-white" : "bg-zinc-800 text-white hover:bg-zinc-700"}
      `}
    >
      {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
      {saved ? "In Watchlist" : "Add to Watchlist"}
    </button>
  );
}
