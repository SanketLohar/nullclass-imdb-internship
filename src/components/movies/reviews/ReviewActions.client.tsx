"use client";

import { useReviews } from "@/_wip/review.context";
import { useAuth } from "@/_wip/auth/auth.context";

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
          className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
        >
          Report
        </button>
      )}
    </div>
  );
}
