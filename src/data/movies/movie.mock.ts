import type { Movie, MovieTrailer } from "./movie.types";

export const moviesMock: Movie[] = [
  {
    id: "123",
    title: "The Batman",
    overview:
      "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",

    posterUrl:
      "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",

    backdropUrl:
      "https://image.tmdb.org/t/p/original/5P8SmMzSNYikXpxil6BYzJ16611.jpg",

    releaseYear: 2022,
    runtime: 176,
    rating: 7.8,
    genres: ["Action", "Crime", "Drama"],
  },
];

export const trailersMock: Record<
  string,
  MovieTrailer[]
> = {
  "123": [
    {
      id: "t1",
      key: "mqqft2x_Aa4",
      site: "YouTube",
      type: "Trailer",
    },
  ],
};
