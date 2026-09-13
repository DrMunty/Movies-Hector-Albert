import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { MoviesService } from './movies-service';
import { MovieQueryParams } from '@models/movie-interface';
import { environment } from '@env/environment';

describe('Feature: Movies Service', () => {
  let service: MoviesService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        MoviesService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(MoviesService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Scenario: Querying Movies with getMovies', () => {
    it('should call popular endpoint when no filters or search query are provided', () => {
      service.getMovies().subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/movie/popular` &&
          request.params.get('page') === '1'
        );
      });

      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.tmdbBearerToken}`);
      expect(req.request.headers.get('accept')).toBe('application/json');

      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });

    it('should call search movie endpoint when a query string is present', () => {
      service.getMovies({ query: 'Inception', page: 2 }).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/search/movie` &&
          request.params.get('query') === 'Inception' &&
          request.params.get('page') === '2'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush({ page: 2, results: [], total_pages: 1, total_results: 0 });
    });

    it('should call discover endpoint when sortBy is primary_release_date.desc and attach today date filter', () => {
      const fixedDate = new Date('2026-09-13T12:00:00.000Z');
      vi.useFakeTimers();
      vi.setSystemTime(fixedDate);

      const params: MovieQueryParams = { sortBy: 'primary_release_date.desc' as const, page: 1 };
      service.getMovies(params).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/discover/movie` &&
          request.params.get('sort_by') === 'primary_release_date.desc' &&
          request.params.get('primary_release_date.lte') === '2026-09-13'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });

      vi.useRealTimers();
    });

    it('should call discover endpoint with vote_average.desc and default vote_count threshold', () => {
      const params: MovieQueryParams = { sortBy: 'vote_average.desc' as const };
      service.getMovies(params).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/discover/movie` &&
          request.params.get('sort_by') === 'vote_average.desc' &&
          request.params.get('vote_count.gte') === '300'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });

    it('should call discover endpoint with genres, release year, rating and custom vote count', () => {
      const params: MovieQueryParams = {
        primaryReleaseYear: 2024,
        voteAverageGte: 7,
        withGenres: 28,
        voteCountGte: 500
      };

      service.getMovies(params).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/discover/movie` &&
          request.params.get('primary_release_year') === '2024' &&
          request.params.get('vote_average.gte') === '7' &&
          request.params.get('with_genres') === '28' &&
          request.params.get('vote_count.gte') === '500'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });
  });

  describe('Scenario: Fetching Movie Genres', () => {
    it('should make GET request to genre movie list endpoint', () => {
      service.getGenres().subscribe();

      const req = httpTestingController.expectOne(`${environment.tmdbBaseUrl}/genre/movie/list`);
      expect(req.request.method).toBe('GET');

      req.flush({ genres: [{ id: 28, name: 'Action' }] });
    });
  });

  describe('Scenario: Fetching Movies by Genre', () => {
    it('should delegate to discover endpoint with with_genres and page params', () => {
      service.getMoviesByGenre(878, 3).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/discover/movie` &&
          request.params.get('with_genres') === '878' &&
          request.params.get('page') === '3'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush({ page: 3, results: [], total_pages: 10, total_results: 200 });
    });
  });

  describe('Scenario: Fetching Movie Details with Credits', () => {
    it('should request movie details with append_to_response credits', () => {
      service.getMovieDetails(550).subscribe();

      const req = httpTestingController.expectOne(
        `${environment.tmdbBaseUrl}/movie/550?append_to_response=credits`
      );

      expect(req.request.method).toBe('GET');
      req.flush({ id: 550, title: 'Fight Club' });
    });
  });
});