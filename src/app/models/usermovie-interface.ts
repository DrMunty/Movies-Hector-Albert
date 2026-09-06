export interface UserMovie {
  id: number;
  title: string;
  poster_path: string;
  isFavorite?: boolean;
  inWatchlist?: boolean;
  isRated?: boolean;
  userRating?: number;
  addedAt: number;
}