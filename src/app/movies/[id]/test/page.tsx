"use client";

import { useReviews } from "@/_wip/review.context";

export default function MovieReviewTest() {
  const { reviews } = useReviews();

  return (
    <div className="p-10 text-white">
      <h1 className="text-xl font-bold mb-4">
        Review Context Debug
      </h1>

      <pre className="text-sm opacity-80">
        {JSON.stringify(reviews, null, 2)}
      </pre>
    </div>
  );
}
