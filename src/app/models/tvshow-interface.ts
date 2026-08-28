import { Genre } from '@models/tmdb-interface';

export interface TvShow {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  origin_country: string[];
  original_language: string;
  original_name: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  first_air_date: string;
  name: string;
  vote_average: number;
  vote_count: number;
}

export interface TvShowDetail extends TvShow {
  genres: Genre[];
  created_by: Array<{
    id: number;
    credit_id: string;
    name: string;
    gender: number;
    profile_path: string | null;
  }>;
  episode_run_time: number[];
  homepage: string;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  number_of_episodes: number;
  number_of_seasons: number;
  status: string;
  tagline: string;
  type: string;
}

export interface TvShowQueryParams {
  page?: number;
  query?: string;
  sortBy?: 'popularity.desc' | 'vote_average.desc' | 'first_air_date.desc';
  firstAirDateYear?: number;
  voteAverageGte?: number;
  voteCountGte?: number;
  withGenres?: number;
}