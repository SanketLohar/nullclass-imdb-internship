import type { MovieCredits } from "./movie.credits.types";

export const movieCreditsMock: Record<
  string,
  MovieCredits
> = {
  "123": {
    cast: [
      {
        id: "c1",
        name: "Robert Pattinson",
        character: "Bruce Wayne / Batman",
        profileUrl:
          "https://image.tmdb.org/t/p/w185/8A4PS5iG7Y1G6KcH0kLZ6fZy0Tz.jpg",
      },
      {
        id: "c2",
        name: "Zoë Kravitz",
        character: "Selina Kyle",
        profileUrl:
          "https://image.tmdb.org/t/p/w185/iCjG2jY4zXzOqjM7xU3Yt9zZ9rR.jpg",
      },
      {
        id: "c3",
        name: "Paul Dano",
        character: "The Riddler",
        profileUrl:
          "https://image.tmdb.org/t/p/w185/7Jahy5LZX2mZ8JkZJ8H0Zs5M9Gz.jpg",
      },
    ],

    crew: [
      {
        id: "d1",
        name: "Matt Reeves",
        job: "Director",
      },
    ],
  },
};
