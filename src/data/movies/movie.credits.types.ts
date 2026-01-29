export type MovieCast = {
  id: string;
  name: string;
  character?: string;
  profileUrl?: string | null;
};

export type MovieCrew = {
  id: string;
  name: string;
  job?: string;
};

export type MovieCredits = {
  cast: MovieCast[];
  crew: MovieCrew[];
};
