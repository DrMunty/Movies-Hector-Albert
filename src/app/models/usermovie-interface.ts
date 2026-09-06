export interface UserMovie {
  id: number;
  title: string;
  poster_path: string | null;
  listType: 'favorites' | 'watchlist';
  userRating?: number;
  addedAt: number;
}