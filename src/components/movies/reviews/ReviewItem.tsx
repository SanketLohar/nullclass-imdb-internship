import { memo, useState } from "react";
import type { Review } from "@/data/reviews/review.types";
import ReviewActions from "./ReviewActions.client";
import StarRatingInput from "./StarRatingInput";

type Props = {
  review: Review;
  currentUserId?: string;
  onDelete?: () => void;
  onReport?: () => void;
  onEdit?: (content: string, rating: number) => void;
};

function formatTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}

function ReviewItem({ review, currentUserId, onDelete, onReport, onEdit }: Props) {
  const isOwner = currentUserId && review.author.id === currentUserId;

  const [isEditing, setIsEditing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [draftContent, setDraftContent] = useState(review.content);
  const [draftRating, setDraftRating] = useState(review.rating);

  const stars = Math.floor(review.rating);

  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all duration-300 hover:scale-[1.01]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-foreground">
              {review.author.username}
            </p>
            {review.updatedAt && review.updatedAt > review.createdAt && (
              <span className="text-xs text-muted-foreground italic">
                (Edited)
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {formatTime(review.updatedAt || review.createdAt)}
            </p>
            {review.revisions && review.revisions.length > 0 && (
              <button
                onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                className="text-xs text-yellow-500 hover:underline"
              >
                {isHistoryOpen ? "Hide History" : "View History"}
              </button>
            )}
          </div>
        </div>

        {!isEditing && (
          <div className="flex items-center gap-2">
            {review.moderation?.isFlagged && (
              <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-500 border border-red-500/20">
                Reported
              </span>
            )}
            <div className="flex items-center gap-1 text-yellow-400 text-sm">
              {Array.from({ length: 5 }).map((_, i) => (
                <span key={i}>{i < stars ? "★" : "☆"}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* History Dropdown */}
      {isHistoryOpen && review.revisions && (
        <div className="mt-2 mb-2 rounded bg-muted/50 p-3 text-xs">
          <p className="font-semibold mb-2 text-foreground">Edit History:</p>
          <div className="space-y-2">
            {review.revisions.map((rev) => (
              <div key={rev.id} className="border-l-2 border-border pl-2">
                <p className="text-muted-foreground mb-1">
                  {new Date(rev.editedAt).toLocaleString()}
                </p>
                <p className="text-foreground/80 line-clamp-2">
                  {rev.previousContent}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

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
            className="mt-3 w-full rounded-md bg-muted p-3 text-sm text-foreground"
            rows={4}
          />

          <div className="mt-3 flex gap-3">
            <button
              onClick={() => {
                // Prevent "phantom edits" if nothing changed
                if (
                  draftContent.trim() === review.content.trim() &&
                  draftRating === review.rating
                ) {
                  setIsEditing(false);
                  return;
                }
                if (onEdit) onEdit(draftContent, draftRating);
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
              className="text-sm text-muted-foreground"
            >
              Cancel
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="mt-3 text-sm leading-relaxed text-foreground">
            {review.content}
          </p>

          <ReviewActions
            isOwner={!!isOwner}
            onEdit={() => setIsEditing(true)}
            onDelete={onDelete}
            onReport={onReport}
          />
        </>
      )}
    </div>
  );
}

export default memo(ReviewItem);
