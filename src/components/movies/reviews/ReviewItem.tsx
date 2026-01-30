import { memo, useState } from "react";
import type { Review } from "@/_wip/review/review.types";
import { useAuth } from "@/_wip/auth/auth.context";
import { useReviews } from "@/_wip/review.context";
import ReviewActions from "./ReviewActions.client";
import StarRatingInput from "./StarRatingInput";

type Props = {
  review: Review;
};

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24)
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;

  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function ReviewItem({ review }: Props) {
  const { user } = useAuth();
  const { updateReview } = useReviews();

  const isOwner = user?.id === review.author.id;

  const [isEditing, setIsEditing] = useState(false);
  const [draftContent, setDraftContent] = useState(review.content);
  const [draftRating, setDraftRating] = useState(review.rating);

  const stars = Math.floor(review.rating / 2);

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 transition-all duration-300 hover:scale-[1.01]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-white">
            {review.author.name}
          </p>
          <p className="text-xs text-neutral-400">
            {formatTime(review.createdAt)}
          </p>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-1 text-yellow-400 text-sm">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i}>{i < stars ? "★" : "☆"}</span>
            ))}
          </div>
        )}
      </div>

      {/* BODY */}
      {isEditing ? (
        <>
          <StarRatingInput
            value={draftRating}
            onChange={setDraftRating}
          />

          <textarea
            value={draftContent}
            onChange={(e) =>
              setDraftContent(e.target.value)
            }
            className="mt-3 w-full rounded-md bg-black/40 p-3 text-sm text-white"
            rows={4}
          />

          <div className="mt-3 flex gap-3">
            <button
              onClick={async () => {
                await updateReview(
                  review.id,
                  draftRating,
                  draftContent
                );
                setIsEditing(false);
              }}
              className="rounded-md bg-yellow-500 px-3 py-1 text-sm text-black"
            >
              Save
            </button>

            <button
              onClick={() => {
                setDraftContent(review.content);
                setDraftRating(review.rating);
                setIsEditing(false);
              }}
              className="text-sm text-neutral-400"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed text-neutral-200">
            {review.content}
          </p>

          {isOwner && (
            <button
              onClick={() => setIsEditing(true)}
              className="mt-2 text-xs text-yellow-400 hover:underline"
            >
              Edit
            </button>
          )}

          <ReviewActions
            reviewId={review.id}
            authorId={review.author.id}
          />
        </>
      )}
    </div>
  );
}

export default memo(ReviewItem);
