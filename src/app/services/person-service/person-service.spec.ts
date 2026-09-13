import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { PersonService } from './person-service';
import { environment } from '@env/environment';

describe('Feature: Person Service', () => {
  let service: PersonService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PersonService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(PersonService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTestingController.verify();
  });

  describe('Scenario: Querying People with getPeople', () => {
    it('should call popular people endpoint when no query is supplied', () => {
      service.getPeople().subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/person/popular` &&
          request.params.get('page') === '1'
        );
      });

      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.tmdbBearerToken}`);
      expect(req.request.headers.get('accept')).toBe('application/json');

      req.flush({ page: 1, results: [], total_pages: 1, total_results: 0 });
    });

    it('should call search person endpoint when query is provided', () => {
      service.getPeople('Nolan', 2).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/search/person` &&
          request.params.get('query') === 'Nolan' &&
          request.params.get('page') === '2'
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush({ page: 2, results: [], total_pages: 1, total_results: 0 });
    });

    it('should fall back to popular endpoint when query consists only of whitespace', () => {
      service.getPeople('   ', 3).subscribe();

      const req = httpTestingController.expectOne((request) => {
        return (
          request.url === `${environment.tmdbBaseUrl}/person/popular` &&
          request.params.get('page') === '3' &&
          !request.params.has('query')
        );
      });

      expect(req.request.method).toBe('GET');
      req.flush({ page: 3, results: [], total_pages: 1, total_results: 0 });
    });
  });

  describe('Scenario: Fetching Person Details', () => {
    it('should query details endpoint appending combined credits', () => {
      service.getPersonDetails(101).subscribe();

      const req = httpTestingController.expectOne(
        `${environment.tmdbBaseUrl}/person/101?append_to_response=combined_credits`
      );

      expect(req.request.method).toBe('GET');
      expect(req.request.headers.get('Authorization')).toBe(`Bearer ${environment.tmdbBearerToken}`);
      expect(req.request.headers.get('accept')).toBe('application/json');

      req.flush({ id: 101, name: 'Cillian Murphy' });
    });
  });
});