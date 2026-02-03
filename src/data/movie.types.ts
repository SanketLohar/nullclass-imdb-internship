/* ================================
   CAST
================================ */

export type CastMember = {
  id: number;
  name: string;
  role: string;
  image: string;
};

/* ================================
   TRAILER
================================ */

export type MovieTrailer = {
  id: string;
  key: string;
  site: "YouTube";
  type: "Trailer" | "Teaser";
};

/* ================================
   MOVIE
================================ */

export type Movie = {
  id: number;
  title: string;
  overview: string;

  posterUrl: string;
  backdropUrl: string;

  releaseYear: number;
  runtime: number;
  rating: number;

  genres: string[];
  cast: CastMember[];
  trailer?: string; // Optional trailer URL
};
