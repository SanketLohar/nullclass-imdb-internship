"use client";

import { Bookmark, Check } from "lucide-react";
import { useWatchlist } from "@/context/watchlist.context";
import { useAuth } from "@/context/auth/auth.context";
import { cn } from "@/lib/utils";
import { MouseEvent } from "react";
import { useRouter } from "next/navigation";
// Actually, I don't see toast imported elsewhere. I'll check layout or utils.
// Checking package.json or similar would be good, but I'll assume basic alert or no toast if not found.
// Wait, I recall seeing toast in previous prompts? No.
// Let's stick to router push and maybe a browser alert if no toast lib is standard.
// Better yet, I'll just redirect to login if no user.

interface WatchlistButtonProps {
    movie: {
        id: string | number;
        title: string;
        posterUrl: string;
        releaseYear: number;
        rating: number;
    };
    className?: string;
    label?: string;
}

export default function WatchlistButton({ movie, className, label }: WatchlistButtonProps) {
    const { isSaved, toggle } = useWatchlist();
    const { user } = useAuth();
    const router = useRouter();
    const saved = isSaved(String(movie.id));

    const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            // Redirect to login if not authenticated
            router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
            return;
        }

        toggle({
            id: String(movie.id),
            title: movie.title,
            posterUrl: movie.posterUrl,
            releaseYear: movie.releaseYear,
            rating: movie.rating,
        });
    };

    return (
        <button
            onClick={handleClick}
            className={cn(
                "transition-colors backdrop-blur-sm flex items-center justify-center gap-2",
                label ? "px-6 py-3 rounded-lg font-semibold" : "p-2 rounded-full",
                saved
                    ? "bg-accent text-accent-foreground hover:opacity-90"
                    : label
                        ? "bg-black/50 text-white hover:bg-black/70 ring-1 ring-white/20"
                        : "bg-black/50 text-white hover:bg-black/70 ring-1 ring-white/20",
                className
            )}
            aria-label={saved ? "Remove from Watchlist" : "Add to Watchlist"}
        >
            {saved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
            {label && <span>{saved ? "In Watchlist" : label}</span>}
        </button>
    );
}
