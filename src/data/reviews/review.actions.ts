"use server";

import { revalidatePath } from "next/cache";
import { addReview } from "./review.repository";

export async function submitReview(
  movieId: number,
  data: {
    authorName: string;
    rating: number;
    content: string;
  }
) {
  await addReview({
    movieId,
    ...data,
  });

  // 🔥 THIS IS THE KEY
  revalidatePath(`/movies/${movieId}`);
}
