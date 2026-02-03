"use client";

import { useEffect, useRef } from "react";
import {
  saveDraft,
  getDraft,
  clearDraft,
} from "@/lib/drafts/reviewDraft.db";

export function useReviewDraft({
  movieId,
  authorName,
  rating,
  content,
  setAuthorName,
  setRating,
  setContent,
}: {
  movieId: number;
  authorName: string;
  rating: number;
  content: string;
  setAuthorName: (v: string) => void;
  setRating: (v: number) => void;
  setContent: (v: string) => void;
}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(
    null
  );

  /* --------------------------------
     LOAD DRAFT ON MOUNT
  --------------------------------- */
  useEffect(() => {
    getDraft(movieId).then((draft) => {
      if (!draft) return;

      setAuthorName(draft.authorName);
      setRating(draft.rating);
      setContent(draft.content);
    });
  }, [movieId]);

  /* --------------------------------
     AUTOSAVE (debounced)
  --------------------------------- */
  useEffect(() => {
    if (!content && !authorName) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      saveDraft({
        movieId,
        authorName,
        rating,
        content,
        updatedAt: Date.now(),
      });
    }, 500);

    return () => {
      if (timeoutRef.current)
        clearTimeout(timeoutRef.current);
    };
  }, [authorName, rating, content]);
}
