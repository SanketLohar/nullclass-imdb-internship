"use client";

import { useState, useRef } from "react";
import { nanoid } from "nanoid";

import { reviewSchema } from "@/data/reviews/review.schema";
import { useReviewDraft } from "@/hooks/useReviewDraft";
import type { ReviewInput } from "@/data/reviews/review.schema";

export type ReviewSubmitPayload = {
  input: ReviewInput;
  idempotencyKey: string;
};

export default function ReviewForm({
  movieId,
  action,
}: {
  movieId: number;
  action: (payload: ReviewSubmitPayload) => void;
}) {
  // Removed authorName - will use logged-in user from auth context
  const [rating, setRating] = useState(8);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const keyRef = useRef(nanoid());

  useReviewDraft({
    movieId,
    authorName: "", // Not used anymore, but keep for draft compatibility
    rating,
    content,
    setAuthorName: () => {}, // No-op since we don't use authorName
    setRating,
    setContent,
  });

  function submit() {
    const input: ReviewInput = {
      movieId,
      rating,
      content,
    };

    const parsed = reviewSchema.safeParse(input);

    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }

    setError(null);

    action({
      input: parsed.data,
      idempotencyKey: keyRef.current,
    });

    import("@/lib/drafts/reviewDraft.db").then(
      ({ clearDraft }) => clearDraft(movieId)
    );

    setRating(8);
    setContent("");

    keyRef.current = nanoid();
  }

  return (
    <div className="bg-zinc-900 p-6 rounded-xl mb-8">
      <h3 className="text-lg font-semibold mb-4">
        Write a Review
      </h3>

      {error && (
        <p className="text-red-400 mb-3 text-sm">
          {error}
        </p>
      )}

      {/* Removed name field - using logged-in user instead */}

      <div className="mb-3">
        <label className="block text-sm text-zinc-400 mb-2">
          Rating (1-10)
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={rating}
          onChange={(e) => setRating(Number(e.target.value))}
          className="w-full bg-zinc-800 p-3 rounded text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-zinc-400 mb-2">
          Your Review
        </label>
        <textarea
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your review..."
          className="w-full bg-zinc-800 p-3 rounded text-white"
        />
      </div>

      <button
        onClick={submit}
        className="bg-yellow-500 text-black px-6 py-2 rounded font-semibold hover:bg-yellow-400 transition-colors"
      >
        Submit Review
      </button>
    </div>
  );
}
