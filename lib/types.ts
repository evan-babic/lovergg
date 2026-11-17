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
