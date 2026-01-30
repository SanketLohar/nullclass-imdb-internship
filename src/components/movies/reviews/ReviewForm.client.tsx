"use client";

import { useState } from "react";
import { useReviews } from "@/_wip/review.context";
import { useAuth } from "@/_wip/auth/auth.context";
import StarRatingInput from "./StarRatingInput";
import { useParams } from "next/navigation";

export default function ReviewForm() {
  const { addReview, hasUserReviewed } = useReviews();
  const { user } = useAuth();
  const params = useParams<{ id: string }>();

  const [rating, setRating] = useState(8);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  // 🔒 not logged in
  if (!user) {
    return (
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-400">
        Please login to write a review.
      </div>
    );
  }

  // 🔐 TS-safe non-null reference
  const currentUser = user;

  // 🚫 already reviewed
  if (hasUserReviewed(currentUser.id)) {
    return (
      <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-neutral-400">
        You have already reviewed this movie.
      </div>
    );
  }

  async function handleSubmit() {
    if (content.trim().length < 5) {
      setError("Review must be at least 5 characters.");
      return;
    }

    setError("");

    await addReview({
      movieId: params.id,
      rating,
      content,
      author: {
        id: currentUser.id,
        name: currentUser.name,
      },
    });

    setContent("");
    setRating(8);
  }

  return (
    <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
      <h3 className="mb-3 text-sm font-semibold text-white">
        Write a review
      </h3>

      <StarRatingInput value={rating} onChange={setRating} />

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Share your thoughts about the movie..."
        className="mt-3 w-full rounded-md bg-black/40 p-3 text-sm text-white outline-none"
        rows={4}
      />

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error}
        </p>
      )}

      <button
        onClick={handleSubmit}
        className="mt-3 rounded-md bg-yellow-500 px-4 py-2 text-sm font-medium text-black hover:bg-yellow-400"
      >
        Submit Review
      </button>
    </div>
  );
}
