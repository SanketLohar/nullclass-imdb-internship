"use client";

import { useEffect } from "react";
import {
  dequeueAll,
  clearQueue,
} from "@/lib/sync/reviewSync.queue";
import { createReview } from "@/data/reviews/review.repository";

export function useReviewBackgroundSync() {
  useEffect(() => {
    async function sync() {
      const items = await dequeueAll();
      if (!items.length) return;

      // Get user from localStorage
      const authData = localStorage.getItem("mock-auth-user");
      if (!authData) {
        console.warn("No user found for background sync");
        return;
      }

      let user;
      try {
        user = JSON.parse(authData);
      } catch {
        return;
      }

      for (const item of items) {
        try {
          const input = item.payload.input;
          await createReview({
            movieId: input.movieId,
            author: {
              id: user.id,
              username: user.username || user.name || "User",
            },
            rating: input.rating,
            content: input.content,
          });
        } catch {
          return; // stop if still offline
        }
      }

      await clearQueue();
    }

    window.addEventListener("online", sync);
    return () =>
      window.removeEventListener("online", sync);
  }, []);
}
