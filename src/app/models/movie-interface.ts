import { Genre } from '@models/tmdb-interface';

export interface Movie {
  adult: boolean;
  backdrop_path: string | null;
  genre_ids: number[];
  id: number;
  original_language: string;
  original_title: string;
  overview: string;
  popularity: number;
  poster_path: string | null;
  release_date: string;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
}

export interface MovieDetail extends Movie {
  budget: number;
  genres: Genre[];
  homepage: string | null;
  imdb_id: string | null;
  origin_country: string[];
  revenue: number;
  runtime: number | null;
  status: string;
  tagline: string | null;
  credits?: {
    cast: any[];
    crew: any[];
  };
}

export interface MovieQueryParams {
  page?: number;
  query?: string;
  sortBy?: 'popularity.desc' | 'vote_average.desc' | 'primary_release_date.desc';
  primaryReleaseYear?: number;
  voteAverageGte?: number;
  withGenres?: number;
  voteCountGte?: number;
}