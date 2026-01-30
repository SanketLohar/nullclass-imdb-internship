"use client";

import { useState, useTransition, useMemo } from "react";

import ReviewForm, {
  ReviewInput,
} from "@/components/reviews/ReviewForm";

import ReviewEditForm from "@/components/reviews/ReviewEditForm.client";
import ReviewVotes from "@/components/reviews/ReviewVotes.client";
import ReviewActions from "@/components/reviews/ReviewActions.client";
import UndoToast from "@/components/reviews/UndoToast.client";
import ReviewEditBadge from "@/components/reviews/ReviewEditBadge.client";
import ReviewHistory from "@/components/reviews/ReviewHistory.client";

import {
  createReview,
  deleteReview,
  voteReview,
  updateReview,
  flagReview,
} from "@/data/reviews/review.repository";

import ReviewSortTabs, {
  ReviewSort,
} from "@/components/reviews/ReviewSortTabs.client";

import { sortReviews } from "@/data/reviews/review.sort";
import type { Review } from "@/data/reviews/review.types";

export default function ReviewsClient({
  movieId,
  initialReviews,
}: {
  movieId: number;
  initialReviews: Review[];
}) {
  const [reviews, setReviews] =
    useState<Review[]>(initialReviews);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [deletedReview, setDeletedReview] =
    useState<Review | null>(null);

  const [historyReview, setHistoryReview] =
    useState<Review | null>(null);

  const [sort, setSort] =
    useState<ReviewSort>("helpful");

  const [, startTransition] = useTransition();

  const sortedReviews = useMemo(
    () => sortReviews(reviews, sort),
    [reviews, sort]
  );

  /* ----------------------------------
     CREATE (optimistic)
  ---------------------------------- */
  async function action(
    movieId: number,
    data: ReviewInput
  ) {
    const optimistic: Review = {
      id: "temp-" + Math.random(),
      movieId,

      author: {
        id: "me",
        username: data.authorName,
      },

      rating: data.rating,
      content: data.content,

      votes: { up: 0, down: 0 },
      score: 0,

      moderation: {
        isFlagged: false,
        flagsCount: 0,
        reasons: [],
      },

      createdAt: 0,
      updatedAt: null,
      deletedAt: null,
      revisions: [],
    };

    setReviews((p) => [optimistic, ...p]);

    startTransition(async () => {
      const saved = await createReview({
        movieId,
        authorId: "me",
        username: data.authorName,
        rating: data.rating,
        content: data.content,
      });

      setReviews((p) =>
        p.map((r) =>
          r.id === optimistic.id ? saved : r
        )
      );
    });
  }

  /* ----------------------------------
     EDIT
  ---------------------------------- */
  function handleEdit(
    review: Review,
    newContent: string
  ) {
    setReviews((p) =>
      p.map((r) =>
        r.id === review.id
          ? { ...r, content: newContent }
          : r
      )
    );

    setEditingId(null);

    startTransition(async () => {
      const saved = await updateReview(
        review.id,
        newContent
      );

      if (!saved) return;

      setReviews((p) =>
        p.map((r) =>
          r.id === review.id ? saved : r
        )
      );
    });
  }

  /* ----------------------------------
     DELETE
  ---------------------------------- */
  function handleDelete(review: Review) {
    setReviews((p) =>
      p.filter((r) => r.id !== review.id)
    );

    setDeletedReview(review);

    startTransition(() => {
      deleteReview(review.id);
    });
  }

  /* ----------------------------------
     REPORT (moderation)
  ---------------------------------- */
  function handleReport(review: Review) {
    // optimistic hide
    setReviews((p) =>
      p.filter((r) => r.id !== review.id)
    );

    startTransition(() => {
      flagReview(review.id, "User reported");
    });
  }

  /* ----------------------------------
     RENDER
  ---------------------------------- */
  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">
        Reviews
      </h2>

      <ReviewSortTabs
        value={sort}
        onChange={setSort}
      />

      <ReviewForm
        movieId={movieId}
        action={action}
      />

      {sortedReviews.map((review) => (
        <div
          key={review.id}
          className="bg-zinc-900 rounded-xl p-5 mb-6"
        >
          <div className="flex justify-between mb-1">
            <p className="font-semibold">
              {review.author.username}
            </p>
            <span className="text-yellow-400">
              ⭐ {review.rating}/10
            </span>
          </div>

          {review.revisions.length > 0 && (
            <ReviewEditBadge
              onClick={() =>
                setHistoryReview(review)
              }
            />
          )}

          {editingId === review.id ? (
            <ReviewEditForm
              initialValue={review.content}
              onSave={(v) =>
                handleEdit(review, v)
              }
              onCancel={() =>
                setEditingId(null)
              }
            />
          ) : (
            <p className="text-zinc-300 mb-3">
              {review.content}
            </p>
          )}

          <ReviewVotes
            up={review.votes.up}
            down={review.votes.down}
            onUpvote={() =>
              voteReview(review.id, "up")
            }
            onDownvote={() =>
              voteReview(review.id, "down")
            }
          />

          {!review.id.startsWith("temp") && (
            <ReviewActions
              onEdit={() =>
                setEditingId(review.id)
              }
              onDelete={() =>
                handleDelete(review)
              }
              onReport={() =>
                handleReport(review)
              }
            />
          )}
        </div>
      ))}

      {deletedReview && (
        <UndoToast
          onUndo={() => {
            setReviews((p) => [
              deletedReview,
              ...p,
            ]);
            setDeletedReview(null);
          }}
          onClose={() =>
            setDeletedReview(null)
          }
        />
      )}

      {historyReview && (
        <ReviewHistory
          review={historyReview}
          onClose={() =>
            setHistoryReview(null)
          }
        />
      )}
    </section>
  );
}
