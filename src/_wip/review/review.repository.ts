import type { Review, ReviewInput } from "./review.types";
import { loadReviews, saveReviews } from "./review.storage";

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

  return Promise.resolve(
    updated.find((r) => r.id === reviewId)!
  );
}

export function deleteReview(reviewId: string): Promise<void> {
  const all = loadReviews().map((r) =>
    r.id === reviewId
      ? { ...r, deletedAt: Date.now() }
      : r
  );

  saveReviews(all);
  return Promise.resolve();
}

export function restoreReview(reviewId: string): Promise<void> {
  const all = loadReviews().map((r) =>
    r.id === reviewId ? { ...r, deletedAt: null } : r
  );

  saveReviews(all);
  return Promise.resolve();
}
