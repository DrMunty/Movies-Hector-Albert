import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Movie, TmdbResponse, MovieQueryParams, GenreResponse, MovieDetail } from '@models/movie-interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = 'https://api.themoviedb.org/3';
  private bearerToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzM2E4NmY4MGY4OTgyNGUzZDMxOTdmOWFhMGUzYzAyYyIsIm5iZiI6MTc4NjQ0NjM1OC42Nywic3ViIjoiNmE3YjAyMTZkYjE5ZThkZGNlMzE5Y2FhIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.2xQxyO6auWyIkrNU4jUJsUmFbKyeg_QV41YEGR5WC2c';

  /**
   * Fetches movies for recommendations, search, or pagination/filters.
   */
  getMovies(params: MovieQueryParams = {}): Observable<TmdbResponse<Movie>> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`
    });

    let httpParams = new HttpParams().set('page', params.page ?? 1);

    // Case 1: Search by movie title
    if (params.query && params.query.trim() !== '') {
      httpParams = httpParams.set('query', params.query);
      return this.http.get<TmdbResponse<Movie>>(`${this.baseUrl}/search/movie`, { headers, params: httpParams });
    }

    // Case 2: Discover endpoint (filtering by rating, release year, or sorting)
    if (params.sortBy || params.primaryReleaseYear || params.voteAverageGte || params.withGenres) {
      if (params.sortBy) {
        httpParams = httpParams.set('sort_by', params.sortBy);
      }
      if (params.primaryReleaseYear) {
        httpParams = httpParams.set('primary_release_year', params.primaryReleaseYear);
      }
      if (params.voteAverageGte) {
        httpParams = httpParams.set('vote_average.gte', params.voteAverageGte);
      }
      if (params.withGenres) {
        httpParams = httpParams.set('with_genres', params.withGenres);
      }

      return this.http.get<TmdbResponse<Movie>>(`${this.baseUrl}/discover/movie`, { headers, params: httpParams });
    }

    // Case 3: Default Popular / Recommendations endpoint
    return this.http.get<TmdbResponse<Movie>>(`${this.baseUrl}/movie/popular`, { headers, params: httpParams });
  }

  /**
   * Fetches full list of official movie genres
   */
  getGenres(): Observable<GenreResponse> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`
    });

    return this.http.get<GenreResponse>(`${this.baseUrl}/genre/movie/list`, { headers });
  }

  getMoviesByGenre(genreId: number, page: number = 1): Observable<TmdbResponse<Movie>> {
    return this.getMovies({ withGenres: genreId, page });
  }

  /**
   * Fetches details for a single movie by ID
   */
  getMovieDetails(movieId: number): Observable<MovieDetail> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`
    });

    return this.http.get<MovieDetail>(`${this.baseUrl}/movie/${movieId}`, { headers });
  }
}