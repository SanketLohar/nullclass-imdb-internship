"use client";

import { useReviews } from "@/_wip/review.context";
import { useAuth } from "@/_wip/auth/auth.context";

export default function ReviewActions({
  reviewId,
  authorId,
}: {
  reviewId: string;
  authorId: string;
}) {
  const { removeReview } = useReviews();
  const { user } = useAuth();

  if (!user || user.id !== authorId) {
    return null;
  }

  const handleDelete = async () => {
    await removeReview(reviewId);

    window.dispatchEvent(
      new CustomEvent("review:deleted", {
        detail: reviewId,
      })
    );
  };

  return (
    <button
      onClick={handleDelete}
      className="mt-3 text-xs text-red-400 hover:underline"
    >
      Delete
    </button>
  );
}
