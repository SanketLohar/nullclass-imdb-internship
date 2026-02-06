"use client";

import { useState, useEffect } from "react";

/**
 * Single source of truth for network connectivity state.
 * Uses navigator.onLine and browser online/offline events.
 * Client-safe to prevent hydration mismatches.
 */
export function useNetworkStatus() {
    const [isOnline, setIsOnline] = useState(() => {
        // Lazy initialization to get actual network status immediately
        if (typeof navigator !== 'undefined') {
            return navigator.onLine;
        }
        return true; // SSR fallback
    });

    useEffect(() => {
        // Set initial state only on client
        setIsOnline(navigator.onLine);

        // Event handlers
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Listen to browser online/offline events
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // Cleanup
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    return {
        isOnline,
        isOffline: !isOnline,
    };
}
