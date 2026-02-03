export type ReviewAuthor = {
  id: string;
  username: string;
};

export type ReviewRevision = {
  id: string;
  previousContent: string;
  editedAt: number;
};

export type ReviewModeration = {
  isFlagged: boolean;
  flagsCount: number;
  reasons: string[];
  hiddenReason?: string;
};

export type ReviewVotes = {
  up: number;
  down: number;
  // Track which users voted to enforce one vote per user
  userVotes?: Record<string, "up" | "down">;
};

export type Review = {
  id: string;

  movieId: number;

  author: ReviewAuthor;

  rating: number;
  content: string;

  votes: ReviewVotes;
  score: number;

  moderation: ReviewModeration;

  revisions: ReviewRevision[];

  createdAt: number;
  updatedAt: number | null;
  deletedAt: number | null;
};
