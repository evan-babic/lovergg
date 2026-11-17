// Game data structure to be used throughout website
export type Game = {
  id: number;
  slug: string;
  title: string;
  year?: number;
  rating?: number;
  coverUrl?: string;
  color?: string;
};

// Expands on Game structure with additional details (for detailed view)
export type GameDetail = Game & {
  summary?: string;
  releaseDate?: string;
  genres: string[];
  platforms: string[];
  developers: string[];
  publishers: string[];
  ratingCount?: number;
  backdropUrl?: string;
  igdbUrl?: string;
};
