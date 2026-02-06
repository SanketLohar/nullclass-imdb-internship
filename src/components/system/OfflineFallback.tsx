"use client";

import { WifiOff, RefreshCw, Bookmark, Edit3 } from "lucide-react";

interface OfflineFallbackProps {
    className?: string;
}

/**
 * Professional, themed offline state UI.
 * Shows clear messaging about offline functionality.
 */
export default function OfflineFallback({ className = "" }: OfflineFallbackProps) {
    const handleRefresh = () => {
        window.location.reload();
    };

    return (
        <div className={`container mx-auto px-4 py-20 ${className}`}>
            <div className="max-w-2xl mx-auto text-center">
                {/* Icon */}
                <div className="mb-6 flex justify-center">
                    <div className="bg-card-bg/50 p-6 rounded-full border border-white/10 backdrop-blur-sm">
                        <WifiOff className="w-12 h-12 text-yellow-500" />
                    </div>
                </div>

                {/* Main Message */}
                <h1 className="text-3xl font-bold mb-4">You&apos;re Offline</h1>

                <p className="text-muted-foreground text-lg mb-8">
                    You need an internet connection to browse movies and actors.
                </p>

                {/* What Still Works */}
                <div className="bg-card-bg/30 border border-white/10 rounded-xl p-6 mb-8 text-left backdrop-blur-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-green-500">✓</span> What Still Works
                    </h2>
                    <ul className="space-y-3">
                        <li className="flex items-start gap-3">
                            <Bookmark className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="block">Watchlist</strong>
                                <span className="text-sm text-muted-foreground">
                                    Add or remove movies (will sync when you&apos;re back online)
                                </span>
                            </div>
                        </li>
                        <li className="flex items-start gap-3">
                            <Edit3 className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                            <div>
                                <strong className="block">Review Drafts</strong>
                                <span className="text-sm text-muted-foreground">
                                    Write and save review drafts locally
                                </span>
                            </div>
                        </li>
                    </ul>
                </div>

                {/* What Doesn't Work */}
                <div className="bg-card-bg/30 border border-white/10 rounded-xl p-6 mb-8 text-left backdrop-blur-sm">
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span className="text-red-500">✗</span> Currently Unavailable
                    </h2>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                        <li>• Browsing movies and actors</li>
                        <li>• Submitting reviews</li>
                        <li>• Login and authentication</li>
                        <li>• Search functionality</li>
                    </ul>
                </div>

                {/* Try Again Button */}
                <button
                    onClick={handleRefresh}
                    className="bg-yellow-500 text-black px-8 py-3 rounded-xl font-semibold hover:bg-yellow-400 transition-colors inline-flex items-center gap-2 shadow-lg"
                >
                    <RefreshCw className="w-5 h-5" />
                    Try Again
                </button>
            </div>
        </div>
    );
}
