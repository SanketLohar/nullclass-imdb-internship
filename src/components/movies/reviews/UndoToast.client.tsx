"use client";

import { useEffect } from "react";
import { useReviews } from "@/context/review.context";

type Props = {
  reviewId: string;
  onClose: () => void;
};

export default function UndoToast({
  reviewId,
  onClose,
}: Props) {
  const { restoreReview } = useReviews();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-md bg-neutral-900 px-4 py-3 text-sm text-white shadow-xl">
      Review deleted
      <button
        onClick={() => {
          restoreReview(reviewId);
          onClose();
        }}
        className="ml-3 text-yellow-400 underline"
      >
        Undo
      </button>
    </div>
  );
}
