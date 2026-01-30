"use client";

import { useState } from "react";

export type ReviewInput = {
  authorName: string;
  rating: number;
  content: string;
};

export default function ReviewForm({
  movieId,
  action,
}: {
  movieId: number;
  action: (movieId: number, data: ReviewInput) => Promise<void>;
}) {
  const [authorName, setAuthorName] = useState("");
  const [rating, setRating] = useState(8);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!authorName || !content) return;

    setLoading(true);

    await action(movieId, {
      authorName,
      rating,
      content,
    });

    setAuthorName("");
    setRating(8);
    setContent("");
    setLoading(false);
  }

  return (
    <div className="bg-zinc-900 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold mb-4">
        Write a Review
      </h3>

      <input
        className="w-full bg-zinc-800 p-3 rounded mb-3"
        placeholder="Your name"
        value={authorName}
        onChange={(e) => setAuthorName(e.target.value)}
      />

      <input
        type="number"
        min={1}
        max={10}
        className="w-full bg-zinc-800 p-3 rounded mb-3"
        value={rating}
        onChange={(e) => setRating(Number(e.target.value))}
      />

      <textarea
        className="w-full bg-zinc-800 p-3 rounded mb-4"
        rows={4}
        placeholder="Your review..."
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="bg-yellow-500 text-black px-6 py-2 rounded font-semibold disabled:opacity-60"
      >
        {loading ? "Posting..." : "Submit Review"}
      </button>
    </div>
  );
}
