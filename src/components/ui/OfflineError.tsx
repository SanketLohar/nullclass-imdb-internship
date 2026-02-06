"use client";

import { RefreshCw } from "lucide-react";

interface OfflineErrorProps {
    message?: string;
    reset?: () => void;
    className?: string;
}

export default function OfflineError({
    message = "You're offline",
    explanation = "This page can’t be loaded without an internet connection.",
    reset,
    className = ""
}: OfflineErrorProps & { explanation?: string }) {
    return (
        <div className={`container mx-auto px-4 py-20 text-center ${className}`}>
            <div className="max-w-md mx-auto bg-card-bg/50 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                <h2 className="text-2xl font-bold mb-4">{message}</h2>
                <p className="text-muted-foreground mb-6">
                    {explanation}
                </p>
                <button
                    onClick={reset || (() => window.location.reload())}
                    className="bg-yellow-500 text-black px-6 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-colors inline-flex items-center gap-2"
                >
                    <RefreshCw className="w-4 h-4" />
                    Try again
                </button>
            </div>
        </div>
    );
}
