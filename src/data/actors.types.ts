export type ActorAward = {
  name: string;
  year: number;
  film?: string;
};

export type FilmographyItem = {
  id: number;
  title: string;
  role: string;
  year: number;
  rating: number;
  poster: string;
};

export type SimilarActor = {
  id: number;
  name: string;
  image: string;
};

export type ActorSocial = {
  instagram?: string;
  twitter?: string;
  imdb?: string;
};

export type Actor = {
  id: number;

  name: string;
  birthDate: string;
  birthPlace: string;

  biography: string;

  image: string;
  coverImage: string;

  social: ActorSocial;

  awards: ActorAward[];

  // 🔥 BIG ONE — used by virtualization
  filmography: FilmographyItem[];

  // used in sidebar / panel
  similarActors: SimilarActor[];
};
