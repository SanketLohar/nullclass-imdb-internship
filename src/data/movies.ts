import type { Movie, MovieTrailer } from "./movie.types";

export const MOVIES: Movie[] = [
  {
    id: 1,
    title: "Dune: Part Two",

    overview:
      "Paul Atreides unites with the Fremen to seek revenge against the conspirators who destroyed his family.",

    posterUrl:
      "https://images.unsplash.com/photo-1534809027769-b00d750a6bac",

    backdropUrl:
      "https://images.unsplash.com/photo-1446776811953-b23d57bd21aa",

    releaseYear: 2024,
    runtime: 166,
    rating: 8.8,

    genres: ["Action", "Adventure", "Sci-Fi"],

    cast: [
      {
        id: 1,
        name: "Timothée Chalamet",
        role: "Paul Atreides",
        image:
          "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d",
      },
      {
        id: 2,
        name: "Zendaya",
        role: "Chani",
        image:
          "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      },
    ],
  },
];

export const MOVIE_TRAILERS: Record<number, MovieTrailer[]> = {
  1: [
    {
      id: "trailer-1",
      key: "mqqft2x_Aa4",
      site: "YouTube",
      type: "Trailer",
    },
  ],
};
