import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { ApiService } from './api-service';
import { MoviesService } from '@services/movies-service/movies-service';
import { TvShowService } from '@services/tvshow-service/tvshow-service';
import { PersonService } from '@services/person-service/person-service';
import { MovieQueryParams } from '@models/movie-interface';
import { TvShowQueryParams } from '@models/tvshow-interface';
import { environment } from '@env/environment';

describe('Feature: ApiService Core Aggregator', () => {
  let service: ApiService;
  let httpTestingController: HttpTestingController;
  let mockMoviesService: {
    getMovies: ReturnType<typeof vi.fn>;
    getGenres: ReturnType<typeof vi.fn>;
    getMoviesByGenre: ReturnType<typeof vi.fn>;
    getMovieDetails: ReturnType<typeof vi.fn>;
  };
  let mockTvShowService: {
    getTvShows: ReturnType<typeof vi.fn>;
    getTvGenres: ReturnType<typeof vi.fn>;
    getTvShowsByGenre: ReturnType<typeof vi.fn>;
    getTvShowDetails: ReturnType<typeof vi.fn>;
  };
  let mockPersonService: {
    getPeople: ReturnType<typeof vi.fn>;
    getPersonDetails: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    mockMoviesService = {
      getMovies: vi.fn().mockReturnValue(of({ results: [] })),
      getGenres: vi.fn().mockReturnValue(of({ genres: [] })),
      getMoviesByGenre: vi.fn().mockReturnValue(of({ results: [] })),
      getMovieDetails: vi.fn().mockReturnValue(of({ id: 1 }))
    };

    mockTvShowService = {
      getTvShows: vi.fn().mockReturnValue(of({ results: [] })),
      getTvGenres: vi.fn().mockReturnValue(of({ genres: [] })),
      getTvShowsByGenre: vi.fn().mockReturnValue(of({ results: [] })),
      getTvShowDetails: vi.fn().mockReturnValue(of({ id: 10 }))
    };

    mockPersonService = {
      getPeople: vi.fn().mockReturnValue(of({ results: [] })),
      getPersonDetails: vi.fn().mockReturnValue(of({ id: 100 }))
    };

    TestBed.configureTestingModule({
      providers: [
        ApiService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: MoviesService, useValue: mockMoviesService },
        { provide: TvShowService, useValue: mockTvShowService },
        { provide: PersonService, useValue: mockPersonService }
      ]
    });

    service = TestBed.inject(ApiService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  describe('Scenario: Multi Search HTTP Request', () => {
    it('should perform GET request to search multi endpoint with default query parameters and authorization header', () => {
      const mockResponse = {
        page: 1,
        results: [{ id: 1, media_type: 'movie', title: 'Inception' }],
        total_pages: 1,
        total_results: 1
      };

      service.searchMulti('Inception').subscribe((res) => {
        expect(res).toEqual(mockResponse);
      });

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/search/multi` &&
          request.params.get('query') === 'Inception' &&
          request.params.get('include_adult') === 'false' &&
          request.params.get('language') === 'en-US' &&
          request.params.get('page') === '1'
        );
      });

      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.tmdbBearerToken}`);
      expect(req.request.headers.get('accept')).toBe('application/json');

      req.flush(mockResponse);
      httpTestingController.verify();
    });

    it('should pass custom page parameter to multi search endpoint', () => {
      service.searchMulti('Matrix', 3).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/search/multi` &&
          request.params.get('query') === 'Matrix' &&
          request.params.get('page') === '3'
        );
      });

      req.flush({ page: 3, results: [], total_pages: 5, total_results: 50 });
      httpTestingController.verify();
    });
  });

  describe('Scenario: Delegating calls to MoviesService', () => {
    it('should delegate getMovies to MoviesService', () => {
      const queryParams: MovieQueryParams = { page: 2, sortBy: 'popularity.desc' as const };
      service.getMovies(queryParams);
      expect(mockMoviesService.getMovies).toHaveBeenCalledWith(queryParams);
    });

    it('should delegate getGenres to MoviesService', () => {
      service.getGenres();
      expect(mockMoviesService.getGenres).toHaveBeenCalled();
    });

    it('should delegate getMoviesByGenre to MoviesService with page parameter', () => {
      service.getMoviesByGenre(28, 2);
      expect(mockMoviesService.getMoviesByGenre).toHaveBeenCalledWith(28, 2);
    });

    it('should delegate getMovieDetails to MoviesService', () => {
      service.getMovieDetails(550);
      expect(mockMoviesService.getMovieDetails).toHaveBeenCalledWith(550);
    });
  });

  describe('Scenario: Delegating calls to TvShowService', () => {
    it('should delegate getTvShows to TvShowService', () => {
      const queryParams: TvShowQueryParams = { page: 1, sortBy: 'vote_average.desc' as const };
      service.getTvShows(queryParams);
      expect(mockTvShowService.getTvShows).toHaveBeenCalledWith(queryParams);
    });

    it('should delegate getTvGenres to TvShowService', () => {
      service.getTvGenres();
      expect(mockTvShowService.getTvGenres).toHaveBeenCalled();
    });

    it('should delegate getTvShowsByGenre to TvShowService with page parameter', () => {
      service.getTvShowsByGenre(18, 4);
      expect(mockTvShowService.getTvShowsByGenre).toHaveBeenCalledWith(18, 4);
    });

    it('should delegate getTvShowDetails to TvShowService', () => {
      service.getTvShowDetails(1399);
      expect(mockTvShowService.getTvShowDetails).toHaveBeenCalledWith(1399);
    });
  });

  describe('Scenario: Delegating calls to PersonService', () => {
    it('should delegate getPeople to PersonService with query and page parameters', () => {
      service.getPeople('Nolan', 2);
      expect(mockPersonService.getPeople).toHaveBeenCalledWith('Nolan', 2);
    });

    it('should delegate getPersonDetails to PersonService', () => {
      service.getPersonDetails(525);
      expect(mockPersonService.getPersonDetails).toHaveBeenCalledWith(525);
    });
  });
});