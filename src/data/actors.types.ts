export type ActorAward = {
  name: string;
  category: string;
  year: number;
  film?: string;
  isWinner: boolean;
};

export type FilmographyItem = {
  id: number;
  title: string;
  role: string;
  year: number;
  rating: number;
  poster: string;
  genre?: string; // For genre filtering
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

export type ActorI18n = {
  name: Record<string, string>; // locale -> name
  alternateNames?: string[]; // Alternate titles/names
  biography?: Record<string, string>; // locale -> biography
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

  // i18n support
  i18n?: ActorI18n;
};
