"use client";

import { X } from "lucide-react";
import type { Review } from "@/data/reviews/review.types";

export default function ReviewHistory({
  review,
  onClose,
}: {
  review: Review;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center">
      <div className="bg-zinc-900 rounded-xl p-6 w-full max-w-lg relative">

        {/* header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Revision History
          </h3>
          <button onClick={onClose}>
            <X className="w-5 h-5 text-zinc-400" />
          </button>
        </div>

        {/* timeline */}
        <div className="space-y-4 max-h-[60vh] overflow-auto">
          {review.revisions.map((rev, index) => (
            <div
              key={rev.id}
              className="border border-zinc-800 rounded-lg p-3"
            >
              <p className="text-xs text-zinc-400 mb-1">
                Revision #{review.revisions.length - index}
              </p>

              <p className="text-sm text-zinc-200 whitespace-pre-line">
                {rev.previousContent}
              </p>
            </div>
          ))}

          {/* original */}
          <div className="border border-zinc-800 rounded-lg p-3 bg-zinc-800/40">
            <p className="text-xs text-zinc-400 mb-1">
              Original
            </p>
            <p className="text-sm text-zinc-200">
              {review.content}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
