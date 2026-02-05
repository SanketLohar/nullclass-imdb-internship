"use client";

import { useEffect, useState } from "react";
import { useReviews } from "@/context/review.context";
import ReviewItem from "./ReviewItem";
import UndoToast from "./UndoToast.client";

export default function ReviewList() {
  const { reviews } = useReviews();

  const [deletedId, setDeletedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"helpful" | "recent" | "rating">("helpful");

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
    if (sortBy === "helpful") {
      return (b.wilsonScore || 0) - (a.wilsonScore || 0) || b.createdAt - a.createdAt;
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
      <div className="mb-6 flex items-center justify-between border-b border-white/5 pb-4">
        <h3 className="text-lg font-semibold text-foreground">Reviews <span className="text-muted-foreground text-sm font-normal ml-2">({visibleReviews.length})</span></h3>

        <div className="flex items-center gap-2 text-sm bg-white/5 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setSortBy("helpful")}
            className={`px-3 py-1.5 rounded-md transition-all ${sortBy === "helpful"
              ? "bg-yellow-400 text-black font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
          >
            Most Helpful
          </button>

          <button
            onClick={() => setSortBy("recent")}
            className={`px-3 py-1.5 rounded-md transition-all ${sortBy === "recent"
              ? "bg-yellow-400 text-black font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
          >
            Recent
          </button>

          <button
            onClick={() => setSortBy("rating")}
            className={`px-3 py-1.5 rounded-md transition-all ${sortBy === "rating"
              ? "bg-yellow-400 text-black font-medium shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              }`}
          >
            Rating
          </button>
        </div>
      </div>

      <section className="space-y-4">
        {sortedReviews.map((review, index) => (
          <ReviewItem
            key={review.id}
            review={review}
            isMostHelpful={sortBy === "helpful" && index === 0 && (review.wilsonScore || 0) > 0}
          />
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
