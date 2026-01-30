import { getReviewsByMovie } from "@/data/reviews/review.repository";
import ReviewsClient from "./ReviewsClient";

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const movieId = Number(id);

  const reviews = await getReviewsByMovie(movieId);

  return (
    <ReviewsClient
      movieId={movieId}
      initialReviews={reviews}
    />
  );
}
