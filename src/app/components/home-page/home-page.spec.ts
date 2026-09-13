import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomePage } from './home-page';
import { ApiService } from '@services/api-service/api-service';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

describe('Feature: Home Page Dashboard', () => {
  let component: HomePage;
  let fixture: ComponentFixture<HomePage>;
  let mockApiService: any;

  const mockGenres = { genres: [{ id: 1, name: 'Action' }, { id: 2, name: 'Sci-Fi' }] };
  const mockMovies = { results: [{ id: 101, title: 'Inception', genre_ids: [1, 2], backdrop_path: '/bg.jpg', vote_average: 8.5 }] };
  const mockTvShows = { results: [{ id: 201, name: 'Breaking Bad', vote_average: 9.5 }] };

  const mockPeoplePage = {
    results: [
      { id: 1, name: 'Valid Actor', known_for_department: 'Acting', profile_path: '/pic1.jpg', adult: false, known_for: [{ vote_count: 200 }], popularity: 100 },
      { id: 2, name: 'No Photo Actor', known_for_department: 'Acting', profile_path: null, adult: false, known_for: [{ vote_count: 500 }], popularity: 90 },
      { id: 3, name: 'Adult Star', known_for_department: 'Acting', profile_path: '/pic3.jpg', adult: true, known_for: [{ vote_count: 150 }], popularity: 80 },
      { id: 4, name: 'Fake Actor', known_for_department: 'Acting', profile_path: '/pic4.jpg', adult: false, known_for: [{ vote_count: 10 }], popularity: 70 }, // vote_count < 100
      { id: 5, name: 'Director Person', known_for_department: 'Directing', profile_path: '/pic5.jpg', adult: false, known_for: [{ vote_count: 300 }], popularity: 60 },
      { id: 3183533, name: 'Blacklisted', known_for_department: 'Acting', profile_path: '/pic6.jpg', adult: false, known_for: [{ vote_count: 500 }], popularity: 50 }
    ]
  };

  const mockDirector = { id: 525, name: 'Christopher Nolan', profile_path: '/nolan.jpg' };

  beforeEach(async () => {
    mockApiService = {
      getGenres: vi.fn().mockReturnValue(of(mockGenres)),
      getMovies: vi.fn().mockReturnValue(of(mockMovies)),
      getTvShows: vi.fn().mockReturnValue(of(mockTvShows)),
      getPeople: vi.fn().mockReturnValue(of(mockPeoplePage)),
      getPersonDetails: vi.fn().mockReturnValue(of(mockDirector))
    };

    vi.useFakeTimers();

    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: mockApiService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HomePage);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Scenario: Dashboard Initialization and Data Loading', () => {
    it('should trigger all API calls and populate signals on init', () => {

      expect(component.featuredMovies().length).toBe(0);

      fixture.detectChanges();

      expect(mockApiService.getGenres).toHaveBeenCalled();
      expect(mockApiService.getMovies).toHaveBeenCalledTimes(3); 
      expect(mockApiService.getTvShows).toHaveBeenCalledTimes(3);
      expect(mockApiService.getPeople).toHaveBeenCalledTimes(4);

      expect(component.featuredMovies().length).toBeGreaterThan(0);
      expect(component.genres().length).toBe(2);
      expect(component.topRatedTv().length).toBeGreaterThan(0);
    });
  });

  describe('Scenario: Hero Carousel Navigation', () => {
    beforeEach(() => {
      component.featuredMovies.set([
        { id: 1, title: 'Movie 1' } as any,
        { id: 2, title: 'Movie 2' } as any,
        { id: 3, title: 'Movie 3' } as any
      ]);
    });

    it('should navigate to the next slide and loop back to the start', () => {

      expect(component.currentSlideIndex()).toBe(0);

      component.nextSlide();
 
      expect(component.currentSlideIndex()).toBe(1);

      component.nextSlide();
      component.nextSlide();

      expect(component.currentSlideIndex()).toBe(0);
    });

    it('should navigate to the previous slide and loop to the end', () => {

      expect(component.currentSlideIndex()).toBe(0);

      component.prevSlide();

      expect(component.currentSlideIndex()).toBe(2);
    });

    it('should start and stop the auto-slide interval', () => {

      component.stopAutoSlide();
      expect((component as any).autoSlideInterval).toBeNull();

      component.startAutoSlide();

      expect((component as any).autoSlideInterval).not.toBeNull();

      component.stopAutoSlide();

      expect((component as any).autoSlideInterval).toBeNull();
    });
  });

  describe('Scenario: Strict Filtering for Popular Actors', () => {
    it('should correctly filter out invalid actors based on the strict rules', () => {

      fixture.detectChanges();

      const actors = component.popularActors();
      expect(actors.length).toBe(4);
      expect(actors[0].name).toBe('Valid Actor');

      const names = actors.map(a => a.name);
      expect(names).not.toContain('No Photo Actor'); 
      expect(names).not.toContain('Adult Star');
      expect(names).not.toContain('Fake Actor'); 
      expect(names).not.toContain('Director Person');
      expect(names).not.toContain('Blacklisted'); 
    });
  });

  describe('Scenario: Data Formatting Utilities', () => {
    it('should correctly format genre IDs into names', () => {

      fixture.detectChanges();

      const result = component.getGenreNames([1, 2]);

      expect(result).toBe('Action, Sci-Fi');
    });

    it('should handle missing genres gracefully', () => {

      const result = component.getGenreNames([999]);

      expect(result).toBe('Película');
    });

    it('should return a valid TMDB image URL or a placeholder', () => {

      const validPath = component.getImageUrl('/test.jpg', 'w500');
      expect(validPath).toBe('https://image.tmdb.org/t/p/w500/test.jpg');

      const nullPath = component.getImageUrl(null);
      expect(nullPath).toContain('via.placeholder.com');
    });
  });
});