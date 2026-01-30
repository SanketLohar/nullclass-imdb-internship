"use client";

import { useState } from "react";
import { reviewInputSchema } from "@/data/reviews/review.schema";

export type ReviewInput = {
  movieId: number;
  authorName: string;
  rating: number;
  content: string;
};

export default function ReviewForm({
  movieId,
  action,
}: {
  movieId: number;
  action: (movieId: number, data: ReviewInput) => void;
}) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(8);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const input = {
      movieId,
      authorName,
      rating,
      content,
    };

    const result = reviewInputSchema.safeParse(input);

    if (!result.success) {
      setError(result.error.issues[0].message);
      return;
    }

    setError(null);

    action(movieId, result.data);

    setAuthorName("");
    setRating(8);
    setContent("");
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

      <input
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
        placeholder="Your name"
        className="w-full bg-zinc-800 p-3 rounded mb-3"
      />

      <input
        type="number"
        min={1}
        max={10}
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
        className="w-full bg-zinc-800 p-3 rounded mb-3"
      />

      <textarea
        rows={4}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write your review..."
        className="w-full bg-zinc-800 p-3 rounded mb-4"
      />

      <button
        onClick={submit}
        className="bg-yellow-500 text-black px-6 py-2 rounded font-semibold"
      >
        Submit Review
      </button>
    </div>
  );
}
