import { Review } from "./review.types";

const CHANNEL_NAME = "review_sync";

export type ReviewSyncMessage =
    | { type: "ADD"; review: Review }
    | { type: "UPDATE"; review: Review }
    | { type: "DELETE"; reviewId: string; movieId: number };

export function initReviewSync(onMessage: (msg: ReviewSyncMessage) => void) {
    if (typeof window === "undefined") return () => { };

    const channel = new BroadcastChannel(CHANNEL_NAME);

    channel.onmessage = (event) => {
        onMessage(event.data);
    };

    return () => channel.close();
}

export function broadcastReviewAdd(review: Review) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: "ADD", review });
    channel.close();
}

export function broadcastReviewUpdate(review: Review) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: "UPDATE", review });
    channel.close();
}

export function broadcastReviewDelete(reviewId: string, movieId: number) {
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage({ type: "DELETE", reviewId, movieId });
    channel.close();
}
