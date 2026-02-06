"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="container mx-auto px-4 py-20 text-center">
            <div className="max-w-md mx-auto bg-card-bg/50 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-4">Something went wrong!</h2>
                <p className="text-muted-foreground mb-6">
                    Unable to load your watchlist. You might be offline or the service is temporarily unavailable.
                </p>
                <button
                    onClick={reset}
                    className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-colors inline-flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                </button>
            </div>
        </div>
    );
}
