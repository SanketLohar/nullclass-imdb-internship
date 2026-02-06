import { Review } from "./review.types";

/* ---------------------------------------
   In-memory DB (mock backend)
---------------------------------------- */

// module-scoped store = persists across requests in dev
export const reviewStore: Review[] = [
  // Helpful reviews (high upvotes, recent)
  {
    id: "r1",
    movieId: 1,
    author: {
      id: "u1",
      username: "rahul_verma",
    },
    rating: 5,
    content: "Visually stunning and emotionally powerful. Villeneuve delivers again.",
    votes: {
      up: 24,
      down: 2,
      userVotes: {},
    },
    score: 0.92,
    wilsonScore: 0.92,

    moderation: {
      isFlagged: false,
      flagsCount: 0,
      reasons: [],
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 2, // 2 hours ago - recent
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
    rating: 4,
    content: "Slow in the middle but world building is insane. The cinematography alone is worth the watch.",
    votes: {
      up: 18,
      down: 1,
      userVotes: {},
    },
    score: 0.95,
    wilsonScore: 0.95,

    moderation: {
      isFlagged: false,
      flagsCount: 0,
      reasons: [],
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 6, // 6 hours ago
    updatedAt: null,
    deletedAt: null,
    revisions: [],
  },
  // Recent reviews
  {
    id: "r3",
    movieId: 1,
    author: {
      id: "u3",
      username: "priya_k",
    },
    rating: 4,
    content: "Just watched it! The ending was unexpected but satisfying.",
    votes: {
      up: 5,
      down: 0,
      userVotes: {},
    },
    score: 1.0,
    wilsonScore: 1.0,

    moderation: {
      isFlagged: false,
      flagsCount: 0,
      reasons: [],
    },
    createdAt: Date.now() - 1000 * 60 * 30, // 30 minutes ago - very recent
    updatedAt: null,
    deletedAt: null,
    revisions: [],
  },
  {
    id: "r4",
    movieId: 1,
    author: {
      id: "u4",
      username: "arjun_m",
    },
    rating: 3,
    content: "Not my cup of tea. Too slow paced for my liking.",
    votes: {
      up: 2,
      down: 8,
      userVotes: {},
    },
    score: 0.2,
    wilsonScore: 0.2,

    moderation: {
      isFlagged: false,
      flagsCount: 0,
      reasons: [],
    },
    createdAt: Date.now() - 1000 * 60 * 60, // 1 hour ago
    updatedAt: null,
    deletedAt: null,
    revisions: [],
  },
  // Controversial reviews (mixed votes)
  {
    id: "r5",
    movieId: 1,
    author: {
      id: "u5",
      username: "sneha_r",
    },
    rating: 3,
    content: "I have mixed feelings. Great visuals but the plot was confusing at times. Some scenes dragged on.",
    votes: {
      up: 12,
      down: 10,
      userVotes: {},
    },
    score: 0.55, // Controversial - close to 0.5
    wilsonScore: 0.55,

    moderation: {
      isFlagged: false,
      flagsCount: 0,
      reasons: [],
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 12, // 12 hours ago
    updatedAt: null,
    deletedAt: null,
    revisions: [],
  },
  {
    id: "r6",
    movieId: 1,
    author: {
      id: "u6",
      username: "vikram_s",
    },
    rating: 2,
    content: "Overrated in my opinion. Expected more based on the hype.",
    votes: {
      up: 3,
      down: 15,
      userVotes: {},
    },
    score: 0.17,
    wilsonScore: 0.17,

    moderation: {
      isFlagged: false,
      flagsCount: 0,
      reasons: [],
    },
    createdAt: Date.now() - 1000 * 60 * 60 * 48, // 2 days ago
    updatedAt: null,
    deletedAt: null,
    revisions: [],
  },
];
