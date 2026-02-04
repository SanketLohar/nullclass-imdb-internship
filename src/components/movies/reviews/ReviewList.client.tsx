"use client";

import { useEffect, useState } from "react";
import { useReviews } from "@/context/review.context";
import ReviewItem from "./ReviewItem";
import UndoToast from "./UndoToast.client";

export default function ReviewList() {
  const { reviews } = useReviews();

  const [deletedId, setDeletedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"recent" | "rating">("recent");

  // listen for delete event
  useEffect(() => {
    function handleDelete(event: Event) {
      const customEvent = event as CustomEvent<string>;
      setDeletedId(customEvent.detail);
    }

    window.addEventListener("review:deleted", handleDelete);
    return () =>
      window.removeEventListener("review:deleted", handleDelete);
  }, []);

  const visibleReviews = reviews.filter(
    (review) => review.deletedAt === null
  );

  const sortedReviews = [...visibleReviews].sort((a, b) => {
    if (sortBy === "rating") {
      return b.rating - a.rating;
    }
    return b.createdAt - a.createdAt;
  });

  if (visibleReviews.length === 0) {
    return (
      <div className="mt-8 text-sm text-neutral-400">
        No reviews yet. Be the first to share your thoughts.
      </div>
    );
  }

  return (
    <>
      {/* Sort controls */}
      <div className="mb-4 flex items-center gap-3 text-sm">
        <span className="text-neutral-400">Sort by:</span>

        <button
          onClick={() => setSortBy("recent")}
          className={
            sortBy === "recent"
              ? "text-white underline"
              : "text-neutral-400"
          }
        >
          Recent
        </button>

        <button
          onClick={() => setSortBy("rating")}
          className={
            sortBy === "rating"
              ? "text-white underline"
              : "text-neutral-400"
          }
        >
          Rating
        </button>
      </div>

      <section className="space-y-4">
        {sortedReviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </section>

      {deletedId && (
        <UndoToast
          reviewId={deletedId}
          onClose={() => setDeletedId(null)}
        />
      )}
    </>
  );
}
