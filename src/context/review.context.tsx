"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Review } from "@/data/reviews/review.types";
import { reviewSchema } from "@/data/reviews/review.schema";
type ReviewInput = {
  movieId: number;
  author: { id: string; username: string };
  rating: number;
  content: string;
};

import {
  createReview,
  deleteReview,
  getReviewsByMovie,
  undoDeleteReview as restoreFromRepo,
  updateReview as updateFromRepo,
} from "@/data/reviews/review.repository";

type ReviewContextType = {
  reviews: Review[];
  addReview: (input: ReviewInput) => Promise<void>;
  updateReview: (
    reviewId: string,
    rating: number,
    content: string
  ) => Promise<void>;
  removeReview: (reviewId: string) => Promise<void>;
  restoreReview: (reviewId: string) => Promise<void>;
  hasUserReviewed: (userId: string) => boolean;
};

const ReviewContext = createContext<ReviewContextType | null>(null);

export function ReviewProvider({
  movieId,
  children,
}: {
  movieId: string;
  children: React.ReactNode;
}) {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    // Convert string movieId to number for the repo
    const mId = Number(movieId);
    if (isNaN(mId)) return;

    // Use getReviewsByMovie from imports (which aliases real repo)
    // We already imported getReviewsByMovie as part of the module
    getReviewsByMovie(mId).then(setReviews);

    // Cross-Tab Sync
    import("@/data/reviews/review.sync").then(({ subscribeToReviewSync }) => {
      const cleanup = subscribeToReviewSync((event) => {
        setReviews((prev) => {
          // 1. FILTER
          const eventMovieId =
            event.type === "REVIEW_DELETE"
              ? String(event.payload.movieId)
              : String(event.payload.movieId);

          if (eventMovieId !== movieId) return prev;

          // 2. MERGE
          /* The sync event payload is typed as ReviewSyncEvent in sync.ts which has specific payload shapes.
             REVIEW_ADD -> payload: Review
             REVIEW_UPDATE -> payload: Review
             REVIEW_RESTORE -> payload: Review
             REVIEW_DELETE -> payload: { reviewId, movieId }
          */

          if (event.type === "REVIEW_ADD") {
            const newReview = event.payload as Review;
            if (prev.some((r) => r.id === newReview.id)) return prev;
            return [newReview, ...prev];
          }

          if (event.type === "REVIEW_UPDATE" || event.type === "REVIEW_RESTORE") {
            const updatedReview = event.payload as Review;
            const exists = prev.some((r) => r.id === updatedReview.id);
            if (!exists) {
              return [updatedReview, ...prev];
            }
            return prev.map((r) =>
              r.id === updatedReview.id ? updatedReview : r
            );
          }

          if (event.type === "REVIEW_DELETE") {
            // payload has reviewId
            return prev.map((r) =>
              r.id === event.payload.reviewId
                ? { ...r, deletedAt: Date.now() }
                : r
            );
          }

          return prev;
        });
      });
      return cleanup;
    });
  }, [movieId]);

  // Helper to get userId - requires user to be logged in for actions
  // The context consumers should handle auth checks usually, but repo requires userId.

  function hasUserReviewed(userId: string) {
    return reviews.some(
      (r) =>
        r.author.id === userId &&
        r.deletedAt === null
    );
  }

  async function addReview(input: ReviewInput) {
    const review = await createReview({
      movieId: input.movieId,
      author: input.author,
      rating: input.rating,
      content: input.content
    });
    setReviews((prev) => [review, ...prev]);
  }

  async function updateReview(
    reviewId: string,
    rating: number,
    content: string
  ) {
    // Need userId. Find existing review to get author.id
    const existing = reviews.find(r => r.id === reviewId);
    if (!existing) return;

    const updated = await updateFromRepo(reviewId, content, existing.author.id);
    if (updated) {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === reviewId ? updated : r
        )
      );
    }
  }

  async function removeReview(reviewId: string) {
    const existing = reviews.find(r => r.id === reviewId);
    if (!existing) return;

    await deleteReview(reviewId, existing.author.id);

    setReviews((prev) =>
      prev.map((review) =>
        review.id === reviewId
          ? { ...review, deletedAt: Date.now() }
          : review
      )
    );
  }

  async function restoreReview(reviewId: string) {
    await restoreFromRepo(reviewId);

    setReviews((prev) => {
      const restored = prev.find(
        (r) => r.id === reviewId
      );

      if (!restored) return prev;

      return [
        { ...restored, deletedAt: null },
        ...prev.filter((r) => r.id !== reviewId),
      ];
    });
  }

  return (
    <ReviewContext.Provider
      value={{
        reviews,
        addReview,
        updateReview,
        removeReview,
        restoreReview,
        hasUserReviewed,
      }}
    >
      {children}
    </ReviewContext.Provider>
  );
}

export function useReviews() {
  const ctx = useContext(ReviewContext);
  if (!ctx) {
    throw new Error(
      "useReviews must be used inside ReviewProvider"
    );
  }
  return ctx;
}
