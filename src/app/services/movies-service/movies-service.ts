import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie, MovieQueryParams, MovieDetail } from '@models/movie-interface';
import { TmdbResponse, GenreResponse } from '@models/tmdb-interface';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root'
})
export class MoviesService {
  private http = inject(HttpClient);
  private baseUrl = environment.tmdbBaseUrl;
  private bearerToken = environment.tmdbBearerToken;

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`
    });
  }

  getMovies(params: MovieQueryParams = {}): Observable<TmdbResponse<Movie>> {
    let httpParams = new HttpParams().set('page', params.page ?? 1);

    if (params.query && params.query.trim() !== '') {
      httpParams = httpParams.set('query', params.query);
      return this.http.get<TmdbResponse<Movie>>(`${this.baseUrl}/search/movie`, { headers: this.headers, params: httpParams });
    }

    if (params.sortBy || params.primaryReleaseYear || params.voteAverageGte || params.withGenres) {
      if (params.sortBy) httpParams = httpParams.set('sort_by', params.sortBy);
      if (params.primaryReleaseYear) httpParams = httpParams.set('primary_release_year', params.primaryReleaseYear);
      if (params.voteAverageGte) httpParams = httpParams.set('vote_average.gte', params.voteAverageGte);
      if (params.withGenres) httpParams = httpParams.set('with_genres', params.withGenres);
      if (params.voteCountGte) httpParams = httpParams.set('vote_count.gte', params.voteCountGte);

      return this.http.get<TmdbResponse<Movie>>(`${this.baseUrl}/discover/movie`, { headers: this.headers, params: httpParams });
    }

    return this.http.get<TmdbResponse<Movie>>(`${this.baseUrl}/movie/popular`, { headers: this.headers, params: httpParams });
  }

  getGenres(): Observable<GenreResponse> {
    return this.http.get<GenreResponse>(`${this.baseUrl}/genre/movie/list`, { headers: this.headers });
  }

  getMoviesByGenre(genreId: number, page: number = 1): Observable<TmdbResponse<Movie>> {
    return this.getMovies({ withGenres: genreId, page });
  }

  getMovieDetails(movieId: number): Observable<MovieDetail> {
    return this.http.get<MovieDetail>(`${this.baseUrl}/movie/${movieId}`, { headers: this.headers });
  }
}