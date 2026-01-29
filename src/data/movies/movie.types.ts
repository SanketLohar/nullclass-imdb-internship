export type Movie = {
  id: string;
  title: string;
  overview: string;

  posterUrl: string | null;
  backdropUrl?: string | null;

  releaseYear?: number;
  runtime?: number;
  rating?: number;

  genres?: string[];
};

export type MovieTrailer = {
  id: string;
  key: string; // YouTube key
  site: "YouTube";
  type: "Trailer" | "Teaser";
};
