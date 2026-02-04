"use client";

import { useState, useTransition, useMemo, useEffect } from "react";

import ReviewForm, {
  ReviewSubmitPayload,
} from "@/components/reviews/ReviewForm";

import ReviewEditForm from "@/components/reviews/ReviewEditForm.client";
import ReviewVotes from "@/components/reviews/ReviewVotes.client";
import ReviewActions from "@/components/reviews/ReviewActions.client";
import UndoToast from "@/components/reviews/UndoToast.client";
import ReviewEditBadge from "@/components/reviews/ReviewEditBadge.client";
import ReviewHistory from "@/components/reviews/ReviewHistory.client";
import ReviewItem from "@/components/movies/reviews/ReviewItem";
import { useReviewLiveUpdates } from "@/hooks/useReviewLiveUpdates";

import { useReviewBackgroundSync } from "@/hooks/useReviewBackgroundSync";

import {
  createReview,
  deleteReview,
  voteReview,
  updateReview,
  flagReview,
  undoDeleteReview,
} from "@/data/reviews/review.repository";

import ReviewSortTabs, {
  ReviewSort,
} from "@/components/reviews/ReviewSortTabs.client";

import { sortReviews } from "@/data/reviews/review.sort";
import type { Review } from "@/data/reviews/review.types";
import { useAuth } from "@/_wip/auth/auth.context";

export default function ReviewsClient({
  movieId,
  initialReviews,
}: {
  movieId: number;
  initialReviews: Review[];
}) {
  // ✅ background retry engine
  useReviewBackgroundSync();

  // Get authenticated user
  const { user } = useAuth();

  const [reviews, setReviews] =
    useState<Review[]>(initialReviews);

  // Hydrate from IndexedDB on mount - merge with initial reviews to avoid duplicates
  useEffect(() => {
    async function hydrate() {
      if (typeof window === "undefined") return;
      try {
        const { getReviewsByMovie } = await import("@/data/reviews/review.repository");
        const dbReviews = await getReviewsByMovie(movieId);
        if (dbReviews.length > 0) {
          // Merge: use IndexedDB as source of truth, but preserve any new reviews from server
          setReviews(prev => {
            const merged = new Map<string, Review>();
            // Add IndexedDB reviews first (source of truth)
            dbReviews.forEach(r => merged.set(r.id, r));
            // Add any new reviews from server that aren't in IndexedDB
            prev.forEach(r => {
              if (!merged.has(r.id)) {
                merged.set(r.id, r);
              }
            });
            return Array.from(merged.values()).sort((a, b) => b.createdAt - a.createdAt);
          });
        }
      } catch (error) {
        console.error("Failed to hydrate reviews:", error);
      }
    }
    hydrate();
  }, [movieId]);

  const [editingId, setEditingId] =
    useState<string | null>(null);

  const [deletedReview, setDeletedReview] =
    useState<Review | null>(null);

  const [notification, setNotification] =
    useState<string | null>(null);

  const [historyReview, setHistoryReview] =
    useState<Review | null>(null);

  const [sort, setSort] =
    useState<ReviewSort>("recent");

  const [, startTransition] = useTransition();

  const sortedReviews = useMemo(
    () => sortReviews(reviews, sort, user?.id),
    [reviews, sort, user?.id]
  );

  /* ----------------------------------
     CREATE (optimistic)
  ---------------------------------- */
  async function action({
    input,
    idempotencyKey,
  }: ReviewSubmitPayload) {
    // Get user info - require authentication
    if (!user) {
      // Show error message in UI instead of alert
      setTimeout(() => {
        const errorElement = document.getElementById("review-auth-error");
        if (errorElement) {
          errorElement.textContent = "Please login to write a review";
          errorElement.classList.remove("hidden");
          setTimeout(() => {
            errorElement.classList.add("hidden");
          }, 5000);
        }
      }, 0);
      return;
    }

    // Generate unique ID using nanoid for better uniqueness
    const { nanoid } = await import("nanoid");
    const optimistic: Review = {
      id: `temp-${nanoid()}`,
      movieId: input.movieId,

      author: {
        id: user.id,
        username: user.username || user.name || "User",
      },

      rating: input.rating,
      content: input.content,

      votes: { up: 0, down: 0, userVotes: {} },
      score: 0,

      moderation: {
        isFlagged: false,
        flagsCount: 0,
        reasons: [],
      },

      createdAt: Date.now(),
      updatedAt: null,
      deletedAt: null,
      revisions: [],
    };

    setReviews((p) => [optimistic, ...p]);

    startTransition(async () => {
      if (!user) return;

      try {
        const saved = await createReview({
          movieId: input.movieId,
          author: {
            id: user.id,
            username: user.username || user.name || "User",
          },
          rating: input.rating,
          content: input.content,
        });

        setReviews((p) =>
          p.map((r) =>
            r.id === optimistic.id ? saved : r
          )
        );
      } catch (error) {
        // Rollback optimistic update on error
        setReviews((p) => p.filter((r) => r.id !== optimistic.id));

        // Show error message
        const errorElement = document.getElementById("review-auth-error");
        if (errorElement) {
          errorElement.textContent = error instanceof Error ? error.message : "Failed to submit review. Please try again.";
          errorElement.classList.remove("hidden");
          setTimeout(() => {
            errorElement.classList.add("hidden");
          }, 5000);
        }
      }
    });
  }

  /* ----------------------------------
     EDIT
  ---------------------------------- */
  function handleEdit(
    review: Review,
    newContent: string
  ) {
    if (!user) return; // Guard

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
        newContent,
        user.id
      );

      if (!saved) {
        // Rollback optimistic update on failure
        setReviews((p) =>
          p.map((r) =>
            r.id === review.id ? review : r
          )
        );
        return;
      }

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
    if (!user) return;

    setReviews((p) =>
      p.filter((r) => r.id !== review.id)
    );

    setDeletedReview(review);

    startTransition(() => {
      deleteReview(review.id, user.id);
    });
  }

  /* ----------------------------------
     REPORT
  ---------------------------------- */
  function handleReport(review: Review) {
    // Don't remove from UI, just update state to show reported status
    setReviews((p) =>
      p.map((r) => r.id === review.id ? {
        ...r,
        moderation: { ...r.moderation, isFlagged: true }
      } : r)
    );

    setNotification("Review reported and added to controversial");
    setTimeout(() => setNotification(null), 3000);

    startTransition(() => {
      flagReview(review.id, "User reported");
    });
  }
  useReviewLiveUpdates({
    movieId,
    onCreate: (review) => {
      setReviews((prev) => {
        if (prev.some((r) => r.id === review.id))
          return prev;
        return [review, ...prev];
      });
    },

    onUpdate: (review) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.id === review.id ? review : r
        )
      );
    },

    onDelete: (id) => {
      setReviews((prev) =>
        prev.filter((r) => r.id !== id)
      );
    },
  });


  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">
        Reviews
      </h2>

      <ReviewSortTabs
        value={sort}
        onChange={setSort}
      />

      {/* Auth error message */}
      <div
        id="review-auth-error"
        className="hidden bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg mb-4"
        role="alert"
        aria-live="polite"
      />

      <ReviewForm
        movieId={movieId}
        action={action}
      />

      <div className="space-y-4">
        {sortedReviews.map((review, index) => (
          <ReviewItem
            key={`${review.id}-${review.createdAt}-${index}`}
            review={review}
            currentUserId={user?.id}
            onDelete={() => handleDelete(review)}
            onReport={() => handleReport(review)}
            onEdit={(content, rating) => handleEdit(review, content)}
          />
        ))}
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-4 right-4 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 p-4 shadow-xl">
            <span className="text-xl">🛡️</span>
            <p className="text-sm font-medium text-white">{notification}</p>
          </div>
        </div>
      )}

      {deletedReview && (
        <UndoToast
          onUndo={() => {
            setReviews((p) => [
              deletedReview,
              ...p,
            ]);
            startTransition(() => {
              undoDeleteReview(deletedReview.id);
            });
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
