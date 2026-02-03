import { openDB, DBSchema } from "idb";
import type { Review } from "./review.types";

const DB_NAME = "movieverse-reviews-db";
const DB_VERSION = 2; // Incremented to match existing database
export const REVIEW_STORE = "reviews";

interface ReviewDB extends DBSchema {
  reviews: {
    key: string;
    value: Review;
    indexes: {
      "by-movie": number;
      "by-user": string;
    };
  };
}

function isBrowser() {
  return typeof window !== "undefined";
}

const dbPromise = isBrowser()
  ? openDB<ReviewDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // During upgrade, we're already in a versionchange transaction
        // The transaction parameter is provided by idb library (4th parameter)
        
        try {
          // Create store if it doesn't exist
          if (!db.objectStoreNames.contains(REVIEW_STORE)) {
            const store = db.createObjectStore(REVIEW_STORE, { keyPath: "id" });
            store.createIndex("by-movie", "movieId");
            store.createIndex("by-user", "author.id");
          } else if (oldVersion < 2) {
            // Version 1 to 2 migration - ensure indexes exist
            // Use the transaction provided by idb library
            if (transaction) {
              const store = transaction.objectStore(REVIEW_STORE);
              if (store) {
                // Check and create indexes if they don't exist
                if (!store.indexNames.contains("by-movie")) {
                  store.createIndex("by-movie", "movieId");
                }
                if (!store.indexNames.contains("by-user")) {
                  store.createIndex("by-user", "author.id");
                }
              }
            }
          }
          // Version 2+ - schema is compatible, no changes needed
        } catch (error) {
          console.error("IndexedDB upgrade error:", error);
          // Don't throw - let the upgrade complete
        }
      },
    })
  : null;

export async function getReviewDB() {
  if (!dbPromise) {
    // During SSR, return null or throw a more descriptive error
    if (typeof window === "undefined") {
      throw new Error("IndexedDB is not available during server-side rendering. Use getReviewsByMovie which handles SSR.");
    }
    throw new Error("IndexedDB not available");
  }
  return dbPromise;
}

/* ------------------------------------
   DB helpers
------------------------------------ */

export async function getReviewsByMovieDB(
  movieId: number
) {
  // This should not be called during SSR - getReviewsByMovie handles SSR
  if (typeof window === "undefined") {
    return [];
  }
  const db = await getReviewDB();
  return db.getAllFromIndex(
    REVIEW_STORE,
    "by-movie",
    movieId
  );
}

export async function getUserReviewDB(
  movieId: number,
  userId: string
) {
  // This should only be called from client-side (createReview)
  if (typeof window === "undefined") {
    return null;
  }
  const db = await getReviewDB();
  const reviews =
    await db.getAllFromIndex(
      REVIEW_STORE,
      "by-movie",
      movieId
    );

  return reviews.find(
    (r) => r.author.id === userId
  );
}

export async function saveReviewDB(
  review: Review
) {
  // This should only be called from client-side
  if (typeof window === "undefined") {
    return;
  }
  const db = await getReviewDB();
  await db.put(REVIEW_STORE, review);
}

export async function deleteReviewDB(
  reviewId: string
) {
  // This should only be called from client-side
  if (typeof window === "undefined") {
    return;
  }
  const db = await getReviewDB();
  await db.delete(REVIEW_STORE, reviewId);
}
