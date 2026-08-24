import { Movie } from './movie-interface';
import { TvShow } from './tvshow-interface';

// KnownFor can be either a Movie or a TV Show
export type KnownForMedia = (Movie & { media_type: 'movie' }) | (TvShow & { media_type: 'tv' });

export interface Person {
  adult: boolean;
  gender: number; // 0: Unspecified, 1: Female, 2: Male, 3: Non-binary
  id: number;
  known_for_department: string; // e.g. "Acting", "Directing", "Writing"
  name: string;
  original_name: string;
  popularity: number;
  profile_path: string | null;
  known_for?: KnownForMedia[]; // Returned in multi-search and popular people endpoints
}

export interface PersonDetail extends Person {
  also_known_as: string[];
  biography: string;
  birthday: string | null;
  deathday: string | null;
  homepage: string | null;
  imdb_id: string;
  place_of_birth: string | null;
}