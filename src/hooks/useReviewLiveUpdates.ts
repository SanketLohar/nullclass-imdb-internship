"use client";

import { useEffect } from "react";
import type { Review } from "@/data/reviews/review.types";

type ReviewEvent =
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

export function useReviewLiveUpdates({
  movieId,
  onCreate,
  onUpdate,
  onDelete,
}: {
  movieId: number;
  onCreate: (r: Review) => void;
  onUpdate: (r: Review) => void;
  onDelete: (id: string) => void;
}) {
  useEffect(() => {
    const source = new EventSource(
      "/api/reviews/stream"
    );

    source.onmessage = (e) => {
      const event: ReviewEvent = JSON.parse(
        e.data
      );

      // 🔒 filter per movie
      if (event.movieId !== movieId) return;

      if (event.type === "create")
        onCreate(event.review);

      if (event.type === "update")
        onUpdate(event.review);

      if (event.type === "delete")
        onDelete(event.reviewId);

      if (event.type === "flag")
        onDelete(event.reviewId);
    };

    source.onerror = () => {
      source.close();
    };

    return () => {
      source.close();
    };
  }, [movieId]);
}
