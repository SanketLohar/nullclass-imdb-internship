"use client";

import { useNetworkStatus } from "@/lib/network/useNetworkStatus";
import OfflineFallback from "./OfflineFallback";

interface OfflineBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

/**
 * Conditional rendering wrapper for offline detection.
 * Shows OfflineFallback when offline, renders children when online.
 */
export default function OfflineBoundary({ children, fallback }: OfflineBoundaryProps) {
    const { isOffline } = useNetworkStatus();

    if (isOffline) {
        return fallback ? <>{fallback}</> : <OfflineFallback />;
    }

    return <>{children}</>;
}
