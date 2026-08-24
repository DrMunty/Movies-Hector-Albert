import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

// Models
import { TmdbResponse, GenreResponse, MultiSearchResult } from '@models/tmdb-interface';
import { Movie, MovieQueryParams, MovieDetail } from '@models/movie-interface';
import { TvShow, TvShowQueryParams, TvShowDetail } from '@models/tvshow-interface';
import { Person, PersonDetail } from '@models/person-interface';

// Domain Services
import { MoviesService } from '@services/movies-service/movies-service';
import { TvShowService } from '@services/tvshow-service/tvshow-service';
import { PersonService } from '@services/person-service/person-service';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  
  // Injected Sub-Services
  private moviesService = inject(MoviesService);
  private tvShowService = inject(TvShowService);
  private personService = inject(PersonService);

  private baseUrl = environment.tmdbBaseUrl;
  private bearerToken = environment.tmdbBearerToken;

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`
    });
  }

  // GLOBAL MULTI-SEARCH (Navbar)
  searchMulti(query: string, page: number = 1): Observable<TmdbResponse<MultiSearchResult>> {
    const params = new HttpParams()
      .set('query', query)
      .set('include_adult', 'false')
      .set('language', 'en-US')
      .set('page', page);

    return this.http.get<TmdbResponse<MultiSearchResult>>(`${this.baseUrl}/search/multi`, {
      headers: this.headers,
      params
    });
  }

  // DELEGATED MOVIE ENDPOINTS
  getMovies(params: MovieQueryParams = {}): Observable<TmdbResponse<Movie>> {
    return this.moviesService.getMovies(params);
  }

  getGenres(): Observable<GenreResponse> {
    return this.moviesService.getGenres();
  }

  getMoviesByGenre(genreId: number, page: number = 1): Observable<TmdbResponse<Movie>> {
    return this.moviesService.getMoviesByGenre(genreId, page);
  }

  getMovieDetails(movieId: number): Observable<MovieDetail> {
    return this.moviesService.getMovieDetails(movieId);
  }

  // DELEGATED TV SHOW ENDPOINTS
  getTvShows(params: TvShowQueryParams = {}): Observable<TmdbResponse<TvShow>> {
    return this.tvShowService.getTvShows(params);
  }

  getTvGenres(): Observable<GenreResponse> {
    return this.tvShowService.getTvGenres();
  }

  getTvShowsByGenre(genreId: number, page: number = 1): Observable<TmdbResponse<TvShow>> {
    return this.tvShowService.getTvShowsByGenre(genreId, page);
  }

  getTvShowDetails(seriesId: number): Observable<TvShowDetail> {
    return this.tvShowService.getTvShowDetails(seriesId);
  }

  // DELEGATED PERSON (ACTORS / DIRECTORS) ENDPOINTS
  getPeople(query?: string, page: number = 1): Observable<TmdbResponse<Person>> {
    return this.personService.getPeople(query, page);
  }

  getPersonDetails(personId: number): Observable<PersonDetail> {
    return this.personService.getPersonDetails(personId);
  }
}