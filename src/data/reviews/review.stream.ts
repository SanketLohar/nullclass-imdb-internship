// Server-Sent Events (SSE) for live review updates
import { Review } from "./review.types";
import { subscribeReviewEvents, ReviewEvent } from "./review.events";

export interface ReviewStreamEvent {
  type: "create" | "update" | "delete" | "vote" | "flag";
  movieId: number;
  review?: Review;
  reviewId?: string;
}

export function createReviewStream(movieId: number): ReadableStream {
  const encoder = new TextEncoder();
  let unsubscribe: (() => void) | null = null;

  return new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify({ type: "connected", movieId })}\n\n`)
      );

      // Subscribe to review events
      unsubscribe = subscribeReviewEvents((event: ReviewEvent) => {
        if (event.movieId === movieId) {
          const data = JSON.stringify({
            type: event.type,
            movieId: event.movieId,
            review: "review" in event ? event.review : undefined,
            reviewId: "reviewId" in event ? event.reviewId : undefined,
          });
          controller.enqueue(encoder.encode(`data: ${data}\n\n`));
        }
      });

      // Keep connection alive with heartbeat
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000); // Every 30 seconds

      // Cleanup on close
      return () => {
        clearInterval(heartbeat);
        if (unsubscribe) unsubscribe();
      };
    },
    cancel() {
      if (unsubscribe) unsubscribe();
    },
  });
}
