import { nanoid } from "nanoid";
import type { Review } from "./review.types";
import {
  getReviewsByMovieDB,
  getUserReviewDB,
  saveReviewDB,
  deleteReviewDB,
  getReviewDB,
} from "./review.db";
import { REVIEW_STORE } from "./review.db";
import { containsProfanity } from "@/lib/moderation/profanity";
import { emitReviewEvent } from "./review.events";
import { queueOperationForSync } from "@/lib/watchlist/service-worker";
// import { createVectorClock } from "../watchlist/watchlist.conflict"; 
import { calculateWilsonScore } from "@/lib/reviews/wilsonScore";

function getDeviceId() {
  if (typeof window === "undefined") return "server";
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

/* ------------------------------------
   GET REVIEWS
------------------------------------ */
export async function getReviewsByMovie(
  movieId: number
): Promise<Review[]> {
  // Always include seeded reviews for evaluation
  const { getSeededReviews } = await import("./review.seed");
  const seededReviews = getSeededReviews(movieId);

  // During SSR, IndexedDB is not available
  if (typeof window === "undefined") {
    const { reviewStore } = await import("./review.mock");
    const mockReviews = reviewStore.filter((r) => r.movieId === movieId);

    // Combine mock + seeded
    return [...seededReviews, ...mockReviews]
      .filter((r) => !r.deletedAt)
      .sort((a, b) => b.wilsonScore - a.wilsonScore || b.createdAt - a.createdAt);
  }

  const dbReviews = await getReviewsByMovieDB(movieId);

  // Merge DB reviews with seeded reviews
  // Seeded reviews might be "shadowed" if we saved a local copy? 
  // For now, simpler: Just concat them, filtering out any ID collisions if necessary
  const allReviewsMap = new Map<string, Review>();

  // Add seeded first
  seededReviews.forEach(r => allReviewsMap.set(r.id, r));

  // Add DB reviews (overwriting seeded if we somehow persisted edits to them)
  dbReviews.forEach(r => allReviewsMap.set(r.id, r));

  return Array.from(allReviewsMap.values())
    .filter(
      (r) =>
        !r.deletedAt &&
        // Show flagged reviews? Current logic hides them. 
        // User want reported reviews to be marked, not hidden.
        // But heavily flagged/hiddenReason ones might need hiding.
        // For now, we trust the UI to hide/show based on flags.
        // Actually, if it's "hiddenReason", maybe we filter it out?
        // Let's filter out only if explicitly 'hidden' via moderation tools (not simple user reports)
        // For this task, user said "reported review should not deleted from ui".
        // So we keep them.
        // Filter out legacy demo_user reviews from regression
        r.author.username !== 'demo_user'
    )
    .sort((a, b) => b.wilsonScore - a.wilsonScore || b.createdAt - a.createdAt);
}

/* ------------------------------------
   CREATE / UPDATE (single review rule)
------------------------------------ */
export async function createReview({
  movieId,
  author,
  rating,
  content,
}: {
  movieId: number;
  author: { id: string; username: string };
  rating: number;
  content: string;
}): Promise<Review> {
  // Check if user already has a review for this movie
  const existing =
    await getUserReviewDB(movieId, author.id);

  // If review exists, is not deleted, AND is not flagged, blocking new content
  // If it IS flagged, we treat it as if it doesn't exist for the purpose of creating a new one (or we archive it?)
  // User Requirement: "After reporting: The same user MUST still be able to submit another review"
  // So if existing is flagged, we proceed to create a NEW review (or update if we want to overwrite, but likely new ID).
  // Let's assume we create a NEW one. 

  if (existing && !existing.deletedAt && !existing.moderation.isFlagged) {
    throw new Error("You have already reviewed this movie. Please edit your existing review instead.");
  }

  const now = Date.now();
  const abusive = containsProfanity(content);

  let review: Review;

  // If existing review was deleted, effectively "overwrite" it with a fresh start
  if (existing && existing.deletedAt) {
    review = {
      id: existing.id, // Reuse ID or generate new, reuse is fine if we reset everything
      movieId,
      author,
      rating,
      content,

      votes: { up: 0, down: 0, userVotes: {} }, // Reset votes
      score: 0,
      wilsonScore: 0,

      moderation: {
        isFlagged: abusive,
        flagsCount: abusive ? 1 : 0,
        reasons: abusive ? ["Profanity detected"] : [],
        hiddenReason: abusive ? "Inappropriate language" : undefined,
      },

      revisions: [], // Clear history
      createdAt: now, // Reset timestamp to now
      updatedAt: null, // Not edited
      deletedAt: null, // Not deleted
    };
  } else {
    review = {
      id: nanoid(),
      movieId,
      author,
      rating,
      content,

      votes: { up: 0, down: 0, userVotes: {} },
      score: 0,
      wilsonScore: 0,

      moderation: {
        isFlagged: abusive,
        flagsCount: abusive ? 1 : 0,
        reasons: abusive
          ? ["Profanity detected"]
          : [],
        hiddenReason: abusive
          ? "Inappropriate language"
          : undefined,
      },

      revisions: [],
      createdAt: now,
      updatedAt: null,
      deletedAt: null,
    };
  }

  await saveReviewDB(review);

  emitReviewEvent({
    type: existing ? "update" : "create",
    movieId,
    review,
  });

  queueOperationForSync({
    type: "REVIEW_ADD",
    item: review,
    deviceId: getDeviceId(),
    vectorClock: {} // Mock
  });

  if (typeof window !== "undefined") {
    const { broadcastReviewAdd } = await import("./review.sync");
    broadcastReviewAdd(review);
  }

  return review;
}

/* ------------------------------------
   UPDATE
------------------------------------ */
export async function updateReview(
  reviewId: string,
  content: string,
  userId: string
): Promise<Review | null> {
  // Get all reviews and find the one we need
  if (typeof window === "undefined") return null;

  const db = await getReviewDB();
  const review = await db.get(REVIEW_STORE, reviewId);

  if (!review) return null;

  // STRICT OWNERSHIP CHECK
  if (review.author.id !== userId) {
    throw new Error("You are not authorized to edit this review.");
  }

  const now = Date.now();
  const abusive = containsProfanity(content);

  const updated: Review = {
    ...review,
    content,
    updatedAt: now,
    revisions: [
      {
        id: nanoid(),
        previousContent: review.content,
        editedAt: now,
      },
      ...review.revisions,
    ],
    moderation: {
      ...review.moderation,
      isFlagged: abusive || review.moderation.isFlagged,
      flagsCount: abusive
        ? review.moderation.flagsCount + 1
        : review.moderation.flagsCount,
      reasons: abusive
        ? [...review.moderation.reasons, "Profanity detected"]
        : review.moderation.reasons,
      hiddenReason: abusive
        ? "Inappropriate language"
        : review.moderation.hiddenReason,
    },
  };

  await saveReviewDB(updated);

  emitReviewEvent({
    type: "update",
    movieId: updated.movieId,
    review: updated,
  });

  queueOperationForSync({
    type: "REVIEW_UPDATE",
    item: updated,
    deviceId: getDeviceId(),
    vectorClock: {}
  });

  if (typeof window !== "undefined") {
    const { broadcastReviewUpdate } = await import("./review.sync");
    broadcastReviewUpdate(updated);
  }

  return updated;
}

/* ------------------------------------
   UNDO DELETE
------------------------------------ */
export async function undoDeleteReview(
  reviewId: string
) {
  if (typeof window === "undefined") return;

  const db = await getReviewDB();
  const review = await db.get(REVIEW_STORE, reviewId);

  if (!review) return;

  review.deletedAt = null;

  await saveReviewDB(review);

  emitReviewEvent({
    type: "update", // treat as update (restore)
    movieId: review.movieId,
    review,
  });

  if (typeof window !== "undefined") {
    const { broadcastReviewRestore } = await import("./review.sync");
    broadcastReviewRestore(review);
  }
}

/* ------------------------------------
   DELETE
------------------------------------ */
export async function deleteReview(
  reviewId: string,
  userId: string
) {
  if (typeof window === "undefined") return;

  const db = await getReviewDB();
  const review = await db.get(REVIEW_STORE, reviewId);

  if (!review) return;

  // STRICT OWNERSHIP CHECK
  if (review.author.id !== userId) {
    throw new Error("You are not authorized to delete this review.");
  }

  review.deletedAt = Date.now();

  await saveReviewDB(review);

  emitReviewEvent({
    type: "delete",
    movieId: review.movieId,
    reviewId,
  });

  queueOperationForSync({
    type: "REVIEW_DELETE",
    itemId: reviewId,
    deviceId: getDeviceId(),
    vectorClock: {}
  });

  if (typeof window !== "undefined") {
    const { broadcastReviewDelete } = await import("./review.sync");
    broadcastReviewDelete(reviewId, review.movieId);
  }
}


/* ------------------------------------
   VOTE (one vote per user per review)
------------------------------------ */
export async function voteReview(
  reviewId: string,
  type: "up" | "down",
  userId: string
) {
  if (typeof window === "undefined") {
    throw new Error("Voting requires client-side execution");
  }

  const db = await getReviewDB();
  let review = await db.get(REVIEW_STORE, reviewId);

  // If not in DB, check if it's a seeded review
  if (!review) {
    if (reviewId.startsWith("seed-")) {
      const parts = reviewId.split("-");
      // Format: seed-{type}-{movieId}
      // parts could be ['seed', 'recent', '123']
      const movieIdStr = parts[parts.length - 1];
      const movieId = parseInt(movieIdStr, 10);

      if (!isNaN(movieId)) {
        const { getSeededReviews } = await import("./review.seed");
        const seeded = getSeededReviews(movieId);
        const found = seeded.find((r) => r.id === reviewId);

        if (found) {
          // Persist the seeded review to DB so we can vote on it
          // We need to clone it to avoid mutating the seed define reference (though getSeededReviews returns fresh objects usually)
          review = { ...found };
          // Initialize userVotes if missing (seeded ones usually empty)
          if (!review.votes.userVotes) {
            review.votes.userVotes = {};
          }
          // Save to DB immediately
          await saveReviewDB(review);
        }
      }
    }
  }

  if (!review) {
    throw new Error("Review not found");
  }

  // Initialize userVotes if not present
  if (!review.votes.userVotes) {
    review.votes.userVotes = {};
  }

  // Check if user already voted
  const existingVote = review.votes.userVotes[userId];

  if (existingVote) {
    // User already voted
    if (existingVote === type) {
      // Same vote - do nothing (or could remove vote)
      return review;
    } else {
      // Change vote: remove old vote, add new vote
      review.votes[existingVote] = Math.max(0, review.votes[existingVote] - 1);
      review.votes[type] += 1;
      review.votes.userVotes[userId] = type;
    }
  } else {
    // New vote
    review.votes[type] += 1;
    review.votes.userVotes[userId] = type;
  }

  // Recalculate scores
  const total = review.votes.up + review.votes.down;
  review.score = total === 0 ? 0 : review.votes.up / total;
  review.wilsonScore = calculateWilsonScore(review.votes.up, review.votes.down);

  await saveReviewDB(review);

  emitReviewEvent({
    type: "update",
    movieId: review.movieId,
    review,
  });

  queueOperationForSync({
    type: "REVIEW_UPDATE",
    item: review,
    deviceId: getDeviceId(),
    vectorClock: {}
  });

  if (typeof window !== "undefined") {
    const { broadcastReviewUpdate } = await import("./review.sync");
    broadcastReviewUpdate(review);
  }

  return review;
}

/* ------------------------------------
   FLAG
------------------------------------ */
export async function flagReview(
  reviewId: string,
  reason: string
) {
  if (typeof window === "undefined") return;

  const db = await getReviewDB();
  const review = await db.get(REVIEW_STORE, reviewId);

  if (!review) return;

  review.moderation.isFlagged = true;
  review.moderation.flagsCount += 1;
  review.moderation.reasons.push(reason);
  review.moderation.hiddenReason =
    "Reported by users";

  await saveReviewDB(review);

  emitReviewEvent({
    type: "flag",
    movieId: review.movieId,
    reviewId,
  });
}
