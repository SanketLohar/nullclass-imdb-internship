import type { Review, ReviewInput } from "./review.types";

import { loadReviews, saveReviews } from "./review.storage";
import {
  broadcastReviewAdd,
  broadcastReviewDelete,
  broadcastReviewRestore,
  broadcastReviewUpdate,
} from "@/data/reviews/review.sync";

function generateId() {
  return Math.random().toString(36).slice(2) + Date.now();
}

export function fetchMovieReviews(movieId: string): Promise<Review[]> {
  const all = loadReviews();
  return Promise.resolve(
    all.filter((r) => r.movieId === movieId)
  );
}

export function createReview(input: ReviewInput): Promise<Review> {
  const review: Review = {
    ...input,
    id: generateId(),
    createdAt: Date.now(),
    deletedAt: null,
  };

  const all = loadReviews();
  saveReviews([review, ...all]);

  broadcastReviewAdd({
    ...review,
    movieId: Number(review.movieId), // Ensure number for data layer consistency
  } as any);

  return Promise.resolve(review);
}

export function updateReview(
  reviewId: string,
  data: {
    rating: number;
    content: string;
  }
): Promise<Review> {
  const all = loadReviews();

  const updated = all.map((r) =>
    r.id === reviewId
      ? {
        ...r,
        rating: data.rating,
        content: data.content,
        updatedAt: Date.now(),
      }
      : r
  );

  saveReviews(updated);

  const updatedReview = updated.find((r) => r.id === reviewId)!;

  broadcastReviewUpdate({
    ...updatedReview,
    movieId: Number(updatedReview.movieId)
  } as any);

  return Promise.resolve(updatedReview);
}

export function deleteReview(reviewId: string): Promise<void> {
  const all = loadReviews().map((r) =>
    r.id === reviewId
      ? { ...r, deletedAt: Date.now() }
      : r
  );

  saveReviews(all);

  const review = loadReviews().find((r) => r.id === reviewId);
  if (review) {
    broadcastReviewDelete(reviewId, Number(review.movieId));
  }

  return Promise.resolve();
}

export function restoreReview(reviewId: string): Promise<void> {
  const all = loadReviews().map((r) =>
    r.id === reviewId ? { ...r, deletedAt: null } : r
  );

  saveReviews(all);

  const review = all.find((r) => r.id === reviewId);
  if (review) {
    broadcastReviewRestore({
      ...review,
      movieId: Number(review.movieId)
    } as any);
  }

  return Promise.resolve();
}
