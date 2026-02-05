"use client";
import { useState, useEffect } from "react";
import Toast from "@/components/ui/Toast";

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
    const { user, login } = useAuth();
    const router = useRouter();
    const saved = isSaved(String(movie.id));

    const [showAuthToast, setShowAuthToast] = useState(false);

    // Auto-hide toast after 3 seconds
    useEffect(() => {
        if (showAuthToast) {
            const timer = setTimeout(() => setShowAuthToast(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showAuthToast]);

    const handleClick = (e: MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            setShowAuthToast(true);
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
        <>
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

            <Toast
                visible={showAuthToast}
                message="Please log in to add to Watchlist"
                actionLabel="Log in"
                onAction={() => {
                    login();
                    setShowAuthToast(false);
                }}
            />
        </>
    );
}
