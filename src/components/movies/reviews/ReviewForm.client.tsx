"use client";

import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import Link from "next/link";
import { useAuth } from "@/context/auth/auth.context";
import StarRatingInput from "./StarRatingInput";
import { reviewSchema } from "@/data/reviews/review.schema";
import type { ReviewInput } from "@/data/reviews/review.schema";
import { useAutosave } from "@/hooks/useAutosave";

export type ReviewSubmitPayload = {
  input: ReviewInput;
  idempotencyKey: string;
};

type Props = {
  movieId: number;
  action: (payload: ReviewSubmitPayload) => void;
};

export default function ReviewForm({ movieId, action }: Props) {
  const { user } = useAuth();

  const [rating, setRating] = useState(4);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  const keyRef = useRef(nanoid());

  // Autosave Hook
  const draftKey = `review-draft-${movieId}-${user?.id || 'anon'}`;
  const { isSaving, savedValue, clear } = useAutosave(draftKey, content);

  // Restore draft when loaded or synced
  useEffect(() => {
    if (savedValue !== null && savedValue !== undefined) {
      setContent(savedValue as string);
    }
  }, [savedValue]);

  // 🔒 not logged in
  if (!user) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground">
        <p>
          Please <Link href="/login" className="text-yellow-500 hover:underline">login</Link> to write a review.
        </p>
      </div>
    );
  }

  function handleSubmit() {
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

    // Clear Draft
    clear();

    // Reset form
    setContent("");
    setRating(4);
    keyRef.current = nanoid();
  }

  return (
    <div className="mt-6 rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">
        Write a review
      </h3>

      <div className="mb-4">
        <label className="block text-xs text-muted-foreground mb-1">
          Rating
        </label>
        <StarRatingInput value={rating} onChange={setRating} />
      </div>

      <div className="mb-4">
        <label className="block text-xs text-muted-foreground mb-1">
          Your Review
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about the movie..."
          className="w-full rounded-md bg-muted p-3 text-sm text-foreground outline-none border border-transparent focus:border-yellow-500/50 transition-colors"
          rows={4}
        />
        {isSaving && <span className="text-xs text-muted-foreground mt-1">Saving draft...</span>}
      </div>

      {error && (
        <p className="mt-2 text-xs text-red-400 mb-2">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        className="rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400 transition-colors"
      >
        Submit Review
      </button>
    </div>
  );
}
