"use client";

import { ThumbsUp, ThumbsDown } from "lucide-react";

export default function ReviewVotes({
  up,
  down,
  onUpvote,
  onDownvote,
}: {
  up: number;
  down: number;
  onUpvote: () => void;
  onDownvote: () => void;
}) {
  return (
    <div className="flex items-center gap-4 mt-3 text-sm">
      <button
        onClick={onUpvote}
        className="flex items-center gap-1 text-zinc-300 hover:text-green-400"
      >
        <ThumbsUp size={16} />
        {up}
      </button>

      <button
        onClick={onDownvote}
        className="flex items-center gap-1 text-zinc-300 hover:text-red-400"
      >
        <ThumbsDown size={16} />
        {down}
      </button>
    </div>
  );
}
