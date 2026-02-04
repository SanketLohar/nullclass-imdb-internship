"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import type { Review, ReviewInput } from "@/_wip/review/review.types";

import {
  createReview,
  deleteReview,
  fetchMovieReviews,
  restoreReview as restoreFromRepo,
  updateReview as updateFromRepo,
} from "@/_wip/review/review.repository";

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
    fetchMovieReviews(movieId).then(setReviews);

    // Cross-Tab Sync via Robust Broadcast System
    import("@/data/reviews/review.sync").then(({ subscribeToReviewSync }) => {
      const cleanup = subscribeToReviewSync((event) => {
        setReviews((prev) => {
          // 1. FILTER: Ignore events for other movies
          // Handle both string and number movieId safely
          const eventMovieId =
            event.type === "REVIEW_DELETE"
              ? String(event.payload.movieId)
              : String(event.payload.movieId);

          if (eventMovieId !== movieId) return prev;

          // 2. MERGE
          if (event.type === "REVIEW_ADD") {
            const newReview = event.payload as unknown as Review; // Cast to WIP Review type
            // Prevent duplicates
            if (prev.some((r) => r.id === newReview.id)) return prev;
            return [newReview, ...prev];
          }

          if (event.type === "REVIEW_UPDATE" || event.type === "REVIEW_RESTORE") {
            const updatedReview = event.payload as unknown as Review; // Cast to WIP Review type
            // If it's a restore, we might need to add it if it's not in the list (if we filtered deleted ones out)
            // But if we are keeping deleted ones with deletedAt in the list, then it's just an update.
            // Check if it exists
            const exists = prev.some((r) => r.id === updatedReview.id);
            if (!exists) {
              // If it's a restore and we don't have it, prepend it?
              return [updatedReview, ...prev];
            }
            return prev.map((r) =>
              r.id === updatedReview.id ? updatedReview : r
            );
          }

          if (event.type === "REVIEW_DELETE") {
            // Mark as deleted (optimistic update style for consistency)
            return prev.map((r) =>
              r.id === event.payload.reviewId
                ? { ...r, deletedAt: Date.now() } // We don't have exact deletedAt from event payload here easily unless we pass simpler payload, but Date.now() is fine for UI
                : r
            );
          }

          return prev;
        });
      });
      return cleanup;
    });
  }, [movieId]);

  function hasUserReviewed(userId: string) {
    return reviews.some(
      (r) =>
        r.author.id === userId &&
        r.deletedAt === null
    );
  }

  async function addReview(input: ReviewInput) {
    const review = await createReview(input);
    setReviews((prev) => [review, ...prev]);
  }

  async function updateReview(
    reviewId: string,
    rating: number,
    content: string
  ) {
    const updated = await updateFromRepo(reviewId, {
      rating,
      content,
    });

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? updated : r
      )
    );
  }

  async function removeReview(reviewId: string) {
    await deleteReview(reviewId);

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
