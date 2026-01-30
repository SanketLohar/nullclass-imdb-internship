/* ------------------------------------
   Review Author
------------------------------------ */

export type ReviewAuthor = {
  id: string;
  username: string;
  avatarUrl?: string;
};

/* ------------------------------------
   Review Revision (edit history)
------------------------------------ */

export type ReviewRevision = {
  id: string;
  previousContent: string;
  editedAt: number;
};

/* ------------------------------------
   Review Votes
------------------------------------ */

export type ReviewVotes = {
  up: number;    // helpful
  down: number;  // not helpful
};

/* ------------------------------------
   Moderation State
------------------------------------ */

export type ReviewModeration = {
  isFlagged: boolean;
  flagsCount: number;
  reasons: string[];
  hiddenReason?: string;
};


/* ------------------------------------
   Review Entity
------------------------------------ */

export type Review = {
  /* identity */
  id: string;
  movieId: number;

  /* ownership */
  author: ReviewAuthor;

  /* content */
  rating: number; // 1–10
  content: string;

  /* voting */
  votes: ReviewVotes;
  score: number; // Wilson score (computed)

  /* moderation */
  moderation: ReviewModeration;

  /* lifecycle */
  createdAt: number;
  updatedAt: number | null;
  deletedAt: number | null;

  /* history */
  revisions: ReviewRevision[];
};
