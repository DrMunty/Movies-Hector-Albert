import { Movie } from './movie-interface';
import { Person } from './person-interface';
import { TvShow } from './tvshow-interface';

export interface TmdbResponse<ItemType> {
  page: number;
  results: ItemType[];
  total_pages: number;
  total_results: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface GenreResponse {
  genres: Genre[];
}

export interface MovieSearchResult extends Movie {
  media_type: 'movie';
}

export interface TvShowSearchResult extends TvShow {
  media_type: 'tv';
}

export interface PersonSearchResult extends Person {
  media_type: 'person';
}

export type MultiSearchResult = MovieSearchResult | TvShowSearchResult | PersonSearchResult;