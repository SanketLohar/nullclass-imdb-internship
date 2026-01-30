export type ReviewAuthor = {
  id: string;
  name: string;
};

export type ReviewInput = {
  movieId: string;
  rating: number; // 1–10
  content: string;
  author: ReviewAuthor;
};

export type Review = ReviewInput & {
  id: string;
  createdAt: number;
  deletedAt: number | null;
};
