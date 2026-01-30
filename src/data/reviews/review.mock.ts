import { Review } from "./review.types";

/* ---------------------------------------
   In-memory DB (mock backend)
---------------------------------------- */

// module-scoped store = persists across requests in dev
export const reviewStore: Review[] = [
  {
    id: "r1",
    movieId: 1,

    author: {
      id: "u1",
      username: "rahul_verma",
    },

    rating: 9,
    content:
      "Visually stunning and emotionally powerful. Villeneuve delivers again.",

    votes: {
      up: 14,
      down: 2,
    },

    score: 0.86,

    moderation: {
      isFlagged: false,
      flagsCount: 0,
    },

    createdAt: Date.now() - 1000 * 60 * 60 * 6,
    updatedAt: null,
    deletedAt: null,

    revisions: [],
  },

  {
    id: "r2",
    movieId: 1,

    author: {
      id: "u2",
      username: "ananya_s",
    },

    rating: 8,
    content:
      "Slow in the middle but world building is insane.",

    votes: {
      up: 8,
      down: 1,
    },

    score: 0.74,

    moderation: {
      isFlagged: false,
      flagsCount: 0,
    },

    createdAt: Date.now() - 1000 * 60 * 60 * 24,
    updatedAt: null,
    deletedAt: null,

    revisions: [],
  },
];
