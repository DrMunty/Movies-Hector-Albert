import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

import { TvShow, TvShowDetail, TvShowQueryParams } from '@models/tvshow-interface';
import { TmdbResponse, GenreResponse } from '@models/tmdb-interface';

@Injectable({
  providedIn: 'root'
})
export class TvShowService {
  private http = inject(HttpClient);
  private baseUrl = environment.tmdbBaseUrl;
  private bearerToken = environment.tmdbBearerToken;

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`
    });
  }

  getTvShows(params: TvShowQueryParams = {}): Observable<TmdbResponse<TvShow>> {
    let httpParams = new HttpParams().set('page', params.page ?? 1);

    // Case 1: Search by TV Show name
    if (params.query && params.query.trim() !== '') {
      httpParams = httpParams.set('query', params.query);
      return this.http.get<TmdbResponse<TvShow>>(`${this.baseUrl}/search/tv`, { headers: this.headers, params: httpParams });
    }

    // Case 2: Discover / Filter TV Shows
    if (params.sortBy || params.firstAirDateYear || params.voteAverageGte || params.withGenres) {
      if (params.sortBy) httpParams = httpParams.set('sort_by', params.sortBy);
      if (params.firstAirDateYear) httpParams = httpParams.set('first_air_date_year', params.firstAirDateYear);
      if (params.voteAverageGte) httpParams = httpParams.set('vote_average.gte', params.voteAverageGte);
      if (params.withGenres) httpParams = httpParams.set('with_genres', params.withGenres);
      if (params.voteCountGte) httpParams = httpParams.set('vote_count.gte', params.voteCountGte);

      return this.http.get<TmdbResponse<TvShow>>(`${this.baseUrl}/discover/tv`, { headers: this.headers, params: httpParams });
    }

    // Case 3: Default Popular TV Shows
    return this.http.get<TmdbResponse<TvShow>>(`${this.baseUrl}/tv/popular`, { headers: this.headers, params: httpParams });
  }

  getTvGenres(): Observable<GenreResponse> {
    return this.http.get<GenreResponse>(`${this.baseUrl}/genre/tv/list`, { headers: this.headers });
  }

  getTvShowsByGenre(genreId: number, page: number = 1): Observable<TmdbResponse<TvShow>> {
    return this.getTvShows({ withGenres: genreId, page });
  }

  getTvShowDetails(id: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/tv/${id}?append_to_response=credits`, { headers: this.headers });
  }
}