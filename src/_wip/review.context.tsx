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
    import("@/data/reviews/review.broadcast").then(({ subscribeToReviewEvents }) => {
      const cleanup = subscribeToReviewEvents((event) => {
        setReviews((prev) => {
          // 1. FILTER: Ignore events for other movies
          const eventMovieId =
            event.type === "DELETE"
              ? event.movieId
              : String(event.review.movieId);

          if (eventMovieId !== movieId) return prev;

          // 2. MERGE
          if (event.type === "ADD") {
            const newReview = event.review;
            // Prevent duplicates
            if (prev.some((r) => r.id === newReview.id)) return prev;
            return [newReview, ...prev];
          }

          if (event.type === "UPDATE") {
            const updatedReview = event.review;
            return prev.map((r) =>
              r.id === updatedReview.id ? updatedReview : r
            );
          }

          if (event.type === "DELETE") {
            // Mark as deleted (optimistic update style for consistency)
            return prev.map((r) =>
              r.id === event.reviewId
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
