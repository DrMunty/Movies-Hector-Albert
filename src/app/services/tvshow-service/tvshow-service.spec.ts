import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TvShowService } from './tvshow-service';
import { TvShowQueryParams } from '@models/tvshow-interface';
import { environment } from '@env/environment';

describe('Feature: TV Show Service', () => {
  let service: TvShowService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        TvShowService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(TvShowService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Scenario: Querying TV Shows with getTvShows', () => {
    it('should call popular tv endpoint when no query or filter parameters are passed', () => {
      service.getTvShows().subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/tv/popular` &&
          request.params.get('page') === '1'
        );
      });

      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.tmdbBearerToken}`);
      expect(req.request.headers.get('accept')).toBe('application/json');

      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });

    it('should call search tv endpoint when a query string is present', () => {
      service.getTvShows({ query: 'Breaking Bad', page: 2 }).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/search/tv` &&
          request.params.get('query') === 'Breaking Bad' &&
          request.params.get('page') === '2'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush({ page: 2, results: [], total_pages: 1, total_results: 0 });
    });

    it('should call discover tv endpoint when filters are provided', () => {
      const params: TvShowQueryParams = {
        sortBy: 'vote_average.desc',
        firstAirDateYear: 2022,
        voteAverageGte: 8,
        withGenres: 18,
        voteCountGte: 100,
        page: 1
      };

      service.getTvShows(params).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/discover/tv` &&
          request.params.get('sort_by') === 'vote_average.desc' &&
          request.params.get('first_air_date_year') === '2022' &&
          request.params.get('vote_average.gte') === '8' &&
          request.params.get('with_genres') === '18' &&
          request.params.get('vote_count.gte') === '100' &&
          request.params.get('page') === '1'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });
  });

  describe('Scenario: Fetching TV Genres', () => {
    it('should make GET request to genre tv list endpoint', () => {
      service.getTvGenres().subscribe();

      const req = httpTestingController.expectOne(`${environment.tmdbBaseUrl}/genre/tv/list`);
      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.tmdbBearerToken}`);
      expect(req.request.headers.get('accept')).toBe('application/json');

      req.flush({ genres: [{ id: 18, name: 'Drama' }] });
    });
  });

  describe('Scenario: Fetching TV Shows by Genre', () => {
    it('should delegate to discover endpoint with with_genres and page params', () => {
      service.getTvShowsByGenre(10765, 3).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/discover/tv` &&
          request.params.get('with_genres') === '10765' &&
          request.params.get('page') === '3'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush({ page: 3, results: [], total_pages: 5, total_results: 100 });
    });
  });

  describe('Scenario: Fetching TV Show Details', () => {
    it('should query tv details endpoint appending credits', () => {
      service.getTvShowDetails(1399).subscribe();

      const req = httpTestingController.expectOne(
        `${environment.tmdbBaseUrl}/tv/1399?append_to_response=credits`
      );

      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.tmdbBearerToken}`);
      expect(req.request.headers.get('accept')).toBe('application/json');

      req.flush({ id: 1399, name: 'Game of Thrones' });
    });
  });
});