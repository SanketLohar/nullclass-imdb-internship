import type { Review } from "./review.types";

const STORAGE_KEY = "movie-reviews";

function isBrowser() {
  return typeof window !== "undefined";
}

/**
 * Low-level persistence only.
 * No filtering.
 * No business logic.
 */
export function loadReviews(): Review[] {
  if (!isBrowser()) return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveReviews(reviews: Review[]): void {
  if (!isBrowser()) return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(reviews)
  );
}
