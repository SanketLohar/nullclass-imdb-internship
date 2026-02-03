// src/data/reviews/review.store.ts
import { openDB } from "idb";
import type { Review } from "./review.types";

const DB_NAME = "reviews-db";
const STORE = "reviews";

const dbPromise =
  typeof window !== "undefined"
    ? openDB(DB_NAME, 1, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, {
              keyPath: "id",
            });
          }
        },
      })
    : null;

export async function getAllReviews(): Promise<Review[]> {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return db.getAll(STORE);
}

export async function saveReview(review: Review) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.put(STORE, review);
}

export async function deleteReview(id: string) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete(STORE, id);
}
