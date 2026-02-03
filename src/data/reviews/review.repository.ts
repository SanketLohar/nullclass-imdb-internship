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

/* ------------------------------------
   GET REVIEWS
------------------------------------ */
export async function getReviewsByMovie(
  movieId: number
): Promise<Review[]> {
  // During SSR, IndexedDB is not available - return mock data or empty array
  if (typeof window === "undefined") {
    // Import mock data for SSR
    const { reviewStore } = await import("./review.mock");
    return reviewStore
      .filter((r) => r.movieId === movieId)
      .filter(
        (r) =>
          !r.deletedAt &&
          !r.moderation.isFlagged
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  const reviews =
    await getReviewsByMovieDB(movieId);

  return reviews
    .filter(
      (r) =>
        !r.deletedAt &&
        !r.moderation.isFlagged
    )
    .sort((a, b) => b.createdAt - a.createdAt);
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

  // If review exists and is not deleted, throw error (one review per user per movie)
  if (existing && !existing.deletedAt) {
    throw new Error("You have already reviewed this movie. Please edit your existing review instead.");
  }

  const now = Date.now();
  const abusive = containsProfanity(content);

  let review: Review;

  // If existing review was deleted, restore it; otherwise create new
  if (existing && existing.deletedAt) {
    review = {
      ...existing,
      rating,
      content,
      deletedAt: null, // Restore deleted review
      updatedAt: now,
      revisions: [
        {
          id: nanoid(),
          previousContent: existing.content,
          editedAt: now,
        },
        ...existing.revisions,
      ],
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

  return review;
}

/* ------------------------------------
   UPDATE
------------------------------------ */
export async function updateReview(
  reviewId: string,
  content: string
): Promise<Review | null> {
  // Get all reviews and find the one we need
  if (typeof window === "undefined") return null;
  
  const db = await getReviewDB();
  const review = await db.get(REVIEW_STORE, reviewId);

  if (!review) return null;

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

  return updated;
}

/* ------------------------------------
   DELETE
------------------------------------ */
export async function deleteReview(
  reviewId: string
) {
  if (typeof window === "undefined") return;
  
  const db = await getReviewDB();
  const review = await db.get(REVIEW_STORE, reviewId);

  if (!review) return;

  review.deletedAt = Date.now();

  await saveReviewDB(review);

  emitReviewEvent({
    type: "delete",
    movieId: review.movieId,
    reviewId,
  });
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
  const review = await db.get(REVIEW_STORE, reviewId);

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
    // User already voted - allow changing vote
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

  // Recalculate score
  const total = review.votes.up + review.votes.down;
  review.score = total === 0 ? 0 : review.votes.up / total;

  await saveReviewDB(review);

  emitReviewEvent({
    type: "update",
    movieId: review.movieId,
    review,
  });

  return review;
}

/* ------------------------------------
   FLAG
------------------------------------ */
export async function flagReview(
  reviewId: string,
  reason: string
) {
  const reviews =
    await getReviewsByMovieDB(0);

  const review = reviews.find(
    (r) => r.id === reviewId
  );

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
