import { useEffect, useRef, useState } from 'react';
import type { Review } from '@/data/reviews/review.types';

type RealtimeStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

interface RealtimeOptions {
    movieId: number;
    onReviewAdded?: (review: Review) => void;
    onReviewUpdated?: (review: Review) => void;
    onReviewDeleted?: (reviewId: string) => void;
}

/**
 * Hook to subscribe to realtime review updates.
 * Currently a scaffolding for future WebSocket/SSE implementation.
 * It is safe to use as it creates the interface without side effects.
 */
export function useRealtimeReviews({
    movieId,
    onReviewAdded,
    onReviewUpdated,
    onReviewDeleted
}: RealtimeOptions) {
    const [status, setStatus] = useState<RealtimeStatus>('disconnected');
    const socketRef = useRef<WebSocket | null>(null); // Placeholder for eventual socket

    useEffect(() => {
        if (!movieId) return;

        // TODO: Implement actual WebSocket or SSE connection here
        // const socket = new WebSocket(\`ws://api.example.com/reviews/\${movieId}\`);

        setStatus('disconnected'); // Remains disconnected for now

        // Placeholder cleanup
        return () => {
            // if (socketRef.current) socketRef.current.close();
        };
    }, [movieId]);

    // Public Interface for manual connect/disconnect (if needed later)
    const connect = () => {
        console.log('[Realtime] Connect requested (Not Implemented)');
    };

    const disconnect = () => {
        console.log('[Realtime] Disconnect requested (Not Implemented)');
    };

    return {
        status,
        connect,
        disconnect
    };
}
