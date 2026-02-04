export type BroadcastReviewEvent =
    | { type: "ADD"; review: any }
    | { type: "UPDATE"; review: any }
    | { type: "DELETE"; reviewId: string; movieId: string };

const CHANNEL_NAME = "REVIEW_REALTIME_SYNC";

export function publishReviewEvent(event: BroadcastReviewEvent) {
    if (typeof window === "undefined") return;
    const channel = new BroadcastChannel(CHANNEL_NAME);
    channel.postMessage(event);
    channel.close();
}

export function subscribeToReviewEvents(
    callback: (event: BroadcastReviewEvent) => void
) {
    if (typeof window === "undefined") return () => { };

    const channel = new BroadcastChannel(CHANNEL_NAME);

    const handler = (msg: MessageEvent<BroadcastReviewEvent>) => {
        callback(msg.data);
    };

    channel.addEventListener("message", handler);

    return () => {
        channel.removeEventListener("message", handler);
        channel.close();
    };
}
