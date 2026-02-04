"use client";

// import { useReviews } from "@/context/review.context";
import { useAuth } from "@/context/auth/auth.context";

export default function ReviewActions({
  onEdit,
  onDelete,
  onReport,
  isOwner,
}: {
  onEdit?: () => void;
  onDelete?: () => void;
  onReport?: () => void;
  isOwner?: boolean;
}) {
  if (isOwner) {
    return (
      <div className="mt-2 flex gap-3">
        {onEdit && (
          <button
            onClick={onEdit}
            className="text-xs text-yellow-400 hover:underline"
          >
            Edit
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="text-xs text-red-400 hover:underline"
          >
            Delete
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="mt-2">
      {onReport && (
        <button
          onClick={onReport}
          className="text-xs font-medium text-muted-foreground hover:text-red-600 transition-colors"
        >
          Report
        </button>
      )}
    </div>
  );
}
