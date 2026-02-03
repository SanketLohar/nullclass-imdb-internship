import type { Review } from "./review.types";

export type ReviewEvent =
  | {
      type: "create";
      movieId: number;
      review: Review;
    }
  | {
      type: "update";
      movieId: number;
      review: Review;
    }
  | {
      type: "delete";
      movieId: number;
      reviewId: string;
    }
  | {
      type: "flag";
      movieId: number;
      reviewId: string;
    };

type Listener = (event: ReviewEvent) => void;

const listeners = new Set<Listener>();

export function emitReviewEvent(event: ReviewEvent) {
  for (const listener of listeners) {
    listener(event);
  }
}

export function subscribeReviewEvents(
  listener: Listener
) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
