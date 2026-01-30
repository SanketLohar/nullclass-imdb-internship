import { reviewStore } from "./review.mock";
import { Review } from "./review.types";
import { containsProfanity } from "@/lib/moderation/profanity";

/* ---------------------------------------
   READ (moderation enforced)
---------------------------------------- */
export async function getReviewsByMovie(
  movieId: number
): Promise<Review[]> {
  return reviewStore
    .filter(
      (r) =>
        r.movieId === movieId &&
        r.deletedAt === null &&
        !r.moderation.isFlagged
    )
    .sort((a, b) => b.score - a.score);
}

/* ---------------------------------------
   CREATE
---------------------------------------- */
export async function createReview(input: {
  movieId: number;
  authorId: string;
  username: string;
  rating: number;
  content: string;
}) {
  const abusive = containsProfanity(input.content);

  const review: Review = {
    id: crypto.randomUUID(),
    movieId: input.movieId,

    author: {
      id: input.authorId,
      username: input.username,
    },

    rating: input.rating,
    content: input.content,

    votes: { up: 0, down: 0 },
    score: 0,

    moderation: {
      isFlagged: abusive,
      flagsCount: abusive ? 1 : 0,
      reasons: abusive
        ? ["Auto profanity detection"]
        : [],
      hiddenReason: abusive
        ? "Inappropriate language detected"
        : undefined,
    },

    createdAt: Date.now(),
    updatedAt: null,
    deletedAt: null,
    revisions: [],
  };

  reviewStore.unshift(review);
  return review;
}

/* ---------------------------------------
   UPDATE
---------------------------------------- */
export async function updateReview(
  reviewId: string,
  newContent: string
): Promise<Review | null> {
  const review = reviewStore.find(
    (r) => r.id === reviewId
  );

  if (!review || review.deletedAt) return null;

  review.revisions.unshift({
    id: crypto.randomUUID(),
    previousContent: review.content,
    editedAt: Date.now(),
  });

  review.content = newContent;
  review.updatedAt = Date.now();

  return review;
}

/* ---------------------------------------
   DELETE (soft)
---------------------------------------- */
export async function deleteReview(
  reviewId: string
): Promise<boolean> {
  const review = reviewStore.find(
    (r) => r.id === reviewId
  );

  if (!review) return false;

  review.deletedAt = Date.now();
  return true;
}

/* ---------------------------------------
   VOTING
---------------------------------------- */
export async function voteReview(
  reviewId: string,
  type: "up" | "down"
): Promise<Review | null> {
  const review = reviewStore.find(
    (r) => r.id === reviewId
  );

  if (!review || review.deletedAt) return null;

  review.votes[type]++;

  const up = review.votes.up;
  const down = review.votes.down;
  const total = up + down;

  review.score =
    total === 0 ? 0 : up / total;

  return review;
}

/* ---------------------------------------
   FLAG / REPORT
---------------------------------------- */
export async function flagReview(
  reviewId: string,
  reason: string
): Promise<Review | null> {
  const review = reviewStore.find(
    (r) => r.id === reviewId
  );

  if (!review) return null;

  review.moderation.isFlagged = true;
  review.moderation.flagsCount += 1;
  review.moderation.reasons.push(reason);

  review.moderation.hiddenReason =
    "Reported by users";

  return review;
}
