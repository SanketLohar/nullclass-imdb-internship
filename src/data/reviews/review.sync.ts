import { Review } from "./review.types";

const CHANNEL_NAME = "reviews-sync";

// Generate a unique ID for the current tab/session to prevent echo
const TAB_ID = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36);

export type ReviewSyncEvent =
    | { type: "REVIEW_ADD"; payload: Review; sourceTabId: string; timestamp: number }
    | { type: "REVIEW_UPDATE"; payload: Review; sourceTabId: string; timestamp: number }
    | { type: "REVIEW_DELETE"; payload: { reviewId: string; movieId: string | number }; sourceTabId: string; timestamp: number }
    | { type: "REVIEW_RESTORE"; payload: Review; sourceTabId: string; timestamp: number };

function getBroadcastChannel() {
    if (typeof window === "undefined" || typeof (globalThis as any).BroadcastChannel === "undefined") {
        return null;
    }
    return new (globalThis as any).BroadcastChannel(CHANNEL_NAME);
}

function postEvent(ids: { type: ReviewSyncEvent["type"]; payload: any }) {
    if (typeof window === "undefined") return;

    const channel = getBroadcastChannel();
    if (!channel) return;

    channel.postMessage({
        ...ids,
        sourceTabId: TAB_ID,
        timestamp: Date.now(),
    });
    channel.close();
}

export function broadcastReviewAdd(review: Review) {
    postEvent({ type: "REVIEW_ADD", payload: review });
}

export function broadcastReviewUpdate(review: Review) {
    postEvent({ type: "REVIEW_UPDATE", payload: review });
}

export function broadcastReviewDelete(reviewId: string, movieId: string | number) {
    postEvent({ type: "REVIEW_DELETE", payload: { reviewId, movieId } });
}

export function broadcastReviewRestore(review: Review) {
    postEvent({ type: "REVIEW_RESTORE", payload: review });
}

export function subscribeToReviewSync(
    onEvent: (event: ReviewSyncEvent) => void
) {
    if (typeof window === "undefined") return () => { };

    const channel = getBroadcastChannel();
    if (!channel) return () => { };

    const handler = (msg: MessageEvent<ReviewSyncEvent>) => {
        const event = msg.data;
        // Ignore events from this same tab
        if (event.sourceTabId === TAB_ID) return;
        onEvent(event);
    };

    channel.addEventListener("message", handler);

    return () => {
        channel.removeEventListener("message", handler);
        channel.close();
    };
}
