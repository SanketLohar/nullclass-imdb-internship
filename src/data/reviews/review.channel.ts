// src/data/reviews/review.channel.ts

import type { Review } from "./review.types";

export type ReviewEvent =
  | { type: "create"; review: Review }
  | { type: "update"; review: Review }
  | { type: "delete"; id: string };

const channel =
  typeof window !== "undefined"
    ? new BroadcastChannel("reviews")
    : null;

export function emitReview(event: ReviewEvent) {
  channel?.postMessage(event);
}

export function onReviewEvent(
  handler: (event: ReviewEvent) => void
) {
  if (!channel) return;

  channel.onmessage = (e) => {
    handler(e.data);
  };
}
