"use client";

import { useReviews } from "@/_wip/review.context";

export default function TestReviewsPage() {
  const { reviews } = useReviews();

  console.log("REVIEWS STATE:", reviews);

  return (
    <div className="p-10 text-white">
      <h1 className="text-2xl font-bold">
        Review context test
      </h1>

      <pre className="mt-6 text-sm opacity-80">
        {JSON.stringify(reviews, null, 2)}
      </pre>
    </div>
  );
}
