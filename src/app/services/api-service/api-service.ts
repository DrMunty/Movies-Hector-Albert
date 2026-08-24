import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { MoviesService } from '@services/movies-service/movies-service';
import { Movie, MovieQueryParams, GenreResponse, MovieDetail } from '@models/movie-interface';
import { TmdbResponse } from '@models/tmdb-interface';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private moviesService = inject(MoviesService);
  // Future domain services:
  // private actorsService = inject(ActorsService);
  // private directorsService = inject(DirectorsService);

  // --- Movie Endpoints ---
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

  // --- Future Actor Endpoints ---
  // getActors(...) { return this.actorsService.getActors(...); }
}