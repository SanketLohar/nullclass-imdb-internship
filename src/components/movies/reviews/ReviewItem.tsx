import { memo, useState } from "react";
import type { Review } from "@/data/reviews/review.types";
import ReviewActions from "./ReviewActions.client";
import ReviewVotes from "../../reviews/ReviewVotes.client";
import StarRatingInput from "./StarRatingInput";

type Props = {
  review: Review;
  currentUserId?: string;
  onDelete?: () => void;
  onReport?: () => void;
  onEdit?: (content: string, rating: number) => void;
  isMostHelpful?: boolean;
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

function ReviewItem({ review, currentUserId, onDelete, onReport, onEdit, isMostHelpful }: Props) {
  const isOwner = currentUserId && review.author.id === currentUserId;

  const [isEditing, setIsEditing] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [draftContent, setDraftContent] = useState(review.content);
  const [draftRating, setDraftRating] = useState(review.rating);

  const stars = Math.floor(review.rating);

  return (
    <div className={`group/card relative rounded-xl border p-4 transition-all duration-300 hover:shadow-lg ${isMostHelpful
      ? "border-yellow-500/40 bg-yellow-500/5 shadow-yellow-500/5 hover:border-yellow-500/60"
      : "border-border bg-card hover:border-yellow-500/20 hover:shadow-yellow-500/5"
      }`}>
      {/* Container for Side-by-Side Layout */}
      <div className="flex gap-4">
        {/* Left Column: Voting (Only visible when NOT editing) */}
        {!isEditing && (
          <div className="flex flex-col items-center pt-1 shrink-0">
            <ReviewVotes
              reviewId={review.id}
              up={review.votes.up}
              down={review.votes.down}
              userVote={currentUserId ? review.votes.userVotes?.[currentUserId] : undefined}
            />
          </div>
        )}

        {/* Right Column: Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground tracking-tight">
                  {review.author.username}
                </span>
                {isMostHelpful && (
                  <span className="flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-500 uppercase tracking-widest border border-yellow-500/20 shadow-sm">
                    Most Helpful
                  </span>
                )}
                {review.updatedAt && review.updatedAt > review.createdAt && (
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                    Edited
                  </span>
                )}
              </div>

              <span className="text-xs text-muted-foreground/50">•</span>

              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  {formatTime(review.updatedAt || review.createdAt)}
                </span>
                {review.revisions && review.revisions.length > 0 && (
                  <button
                    onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                    className="text-xs text-yellow-500/80 hover:text-yellow-400 hover:underline transition-colors"
                  >
                    {isHistoryOpen ? "Hide History" : "History"}
                  </button>
                )}
              </div>
            </div>

            {!isEditing && (
              <div className="flex items-center gap-3">
                {review.moderation?.isFlagged && (
                  <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-500 uppercase tracking-widest border border-red-500/20">
                    Reported
                  </span>
                )}
                <div
                  className="flex items-center gap-0.5 text-yellow-400"
                  aria-label={`${stars} out of 5 stars`}
                >
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span key={i} className={`text-sm leading-none ${i < stars ? "text-yellow-400" : "text-zinc-700"}`}>
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-sm font-bold text-foreground">{stars}/5</span>
                </div>
              </div>
            )}
          </div>

          {/* History Dropdown */}
          {isHistoryOpen && review.revisions && (
            <div className="mb-4 rounded-lg bg-muted/30 p-3 text-xs border border-border/50">
              <p className="font-semibold mb-2 text-foreground/80 uppercase tracking-wider text-[10px]">Edit History</p>
              <div className="space-y-3">
                {review.revisions.map((rev) => (
                  <div key={rev.id} className="relative border-l-2 border-border pl-3 ml-1">
                    <p className="text-muted-foreground mb-1 text-[10px] font-medium">
                      {new Date(rev.editedAt).toLocaleString()}
                    </p>
                    <p className="text-foreground/70 italic line-clamp-2">
                      "{rev.previousContent}"
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BODY */}
          {isEditing ? (
            <div className="animate-in fade-in zoom-in-95 duration-200">
              <StarRatingInput
                value={draftRating}
                onChange={setDraftRating}
              />

              <textarea
                value={draftContent}
                onChange={(e) =>
                  setDraftContent(e.target.value)
                }
                className="mt-3 w-full rounded-lg bg-muted/50 p-3 text-sm text-foreground border border-border focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 outline-none transition-all placeholder:text-muted-foreground/50 resize-y min-h-[120px]"
                rows={5}
                placeholder="Write your review here..."
              />

              <div className="mt-4 flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setDraftContent(review.content);
                    setDraftRating(review.rating);
                    setIsEditing(false);
                  }}
                  className="px-4 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={() => {
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
                  className="rounded-md bg-yellow-400 px-4 py-1.5 text-sm font-bold text-black hover:bg-yellow-300 transition-colors shadow-sm hover:shadow-md hover:shadow-yellow-400/20"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div className="group-hover/card:translate-x-1 transition-transform duration-300 ease-out">
              <p className="text-sm leading-7 text-zinc-300 whitespace-pre-wrap">
                {review.content}
              </p>

              <div className="mt-4 pt-4 border-t border-border/40 flex justify-end">
                <ReviewActions
                  isOwner={!!isOwner}
                  onEdit={() => setIsEditing(true)}
                  onDelete={onDelete}
                  onReport={onReport}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default memo(ReviewItem);
