import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { UserRanking } from './user-ranking';
import { DbService } from '@services/database/database-service';
import { ApiService } from '@services/api-service/api-service';
import { AuthService } from '@services/auth/auth';

describe('Feature: User Ranking Component', () => {
  let component: UserRanking;
  let fixture: ComponentFixture<UserRanking>;
  let mockDbService: any;
  let mockApiService: any;
  let mockAuthService: any;

  const mockGlobalRankings = [
    { id: 101, favoriteCount: 5, averageRating: 8.5 },
    { id: 102, favoriteCount: 10, averageRating: 9.0 },
    { id: 103, favoriteCount: 5, averageRating: 7.0 }
  ];

  const mockMovieDetailsMap: Record<number, any> = {
    101: { id: 101, title: 'Inception', poster_path: '/inc.jpg', vote_average: 8.5 },
    102: { id: 102, title: 'Interstellar', poster_path: '/int.jpg', vote_average: 9.0 },
    103: { id: 103, title: 'Memento', poster_path: '/mem.jpg', vote_average: 7.0 }
  };

  const mockUserMovies = [
    { id: 102, isFavorite: true, inWatchlist: false, isRated: false }
  ];

  beforeEach(async () => {
    vi.useFakeTimers();

    mockDbService = {
      getGlobalRankings: vi.fn().mockResolvedValue(mockGlobalRankings),
      getUserMovies: vi.fn().mockReturnValue(of(mockUserMovies)),
      saveMovie: vi.fn().mockResolvedValue(undefined),
      removeMovie: vi.fn().mockResolvedValue(undefined)
    };

    mockApiService = {
      getMovieDetails: vi.fn().mockImplementation((id: number) => of(mockMovieDetailsMap[id] || { id, title: `Movie ${id}` }))
    };

    mockAuthService = {
      currentUser: signal({ uid: 'user_test' })
    };

    await TestBed.configureTestingModule({
      imports: [UserRanking],
      providers: [
        provideRouter([]),
        { provide: DbService, useValue: mockDbService },
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserRanking);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Scenario: Initialization, Sorting, and Data Loading', () => {
    it('should sort rankings by favoriteCount descending then averageRating descending', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(mockDbService.getGlobalRankings).toHaveBeenCalled();
      expect(mockDbService.getUserMovies).toHaveBeenCalled();
      expect(component.rankings().length).toBe(3);
      expect(component.rankings()[0].id).toBe(102);
      expect(component.rankings()[1].id).toBe(101);
      expect(component.rankings()[2].id).toBe(103);
      expect(component.isLoading()).toBe(false);
    });

    it('should handle empty global rankings list', async () => {
      mockDbService.getGlobalRankings.mockResolvedValueOnce([]);

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.rankings()).toEqual([]);
      expect(component.isLoading()).toBe(false);
    });

    it('should handle API error when fetching movie details for ranking list', async () => {
      mockApiService.getMovieDetails.mockReturnValue(throwError(() => new Error('API Error')));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isLoading()).toBe(false);
    });

    it('should handle database error when fetching global rankings', async () => {
      mockDbService.getGlobalRankings.mockRejectedValueOnce(new Error('DB Error'));

      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Scenario: State Check Helpers and Local Updates', () => {
    it('should correctly report movie favorite, watchlist, and rated status', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      expect(component.isMovieFavorite(102)).toBe(true);
      expect(component.isMovieWatchlisted(102)).toBe(false);
      expect(component.isMovieRated(102)).toBe(false);
    });

    it('should update local state for existing and new saved movies', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.updateLocalState(102, 'inWatchlist', true);
      expect(component.isMovieWatchlisted(102)).toBe(true);

      component.updateLocalState(999, 'isFavorite', true);
      expect(component.isMovieFavorite(999)).toBe(true);
    });
  });

  describe('Scenario: Navigation and Routing Interactions', () => {
    it('should navigate to movie details if click target is outside any button', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      const mockEvent = {
        target: document.createElement('div')
      } as unknown as Event;

      component.goToMovieDetails(mockEvent, 101);

      expect(navigateSpy).toHaveBeenCalledWith(['/movie', 101]);
    });

    it('should not navigate to movie details if click target is a button', () => {
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      const button = document.createElement('button');
      const mockEvent = {
        target: button
      } as unknown as Event;

      component.goToMovieDetails(mockEvent, 101);

      expect(navigateSpy).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Authentication Protection', () => {
    it('should redirect unauthenticated users to login on watchlist toggle', async () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      await component.addToWatchlist({ id: 101, title: 'Inception' });

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(mockDbService.saveMovie).not.toHaveBeenCalled();
    });

    it('should redirect unauthenticated users to login on favorite toggle', async () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      await component.addToFavorites({ id: 101, title: 'Inception' });

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(mockDbService.saveMovie).not.toHaveBeenCalled();
    });

    it('should redirect unauthenticated users to login on openRatingModal', () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.openRatingModal({ id: 101, title: 'Inception' });

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(component.isRatingModalOpen()).toBe(false);
    });
  });

  describe('Scenario: Toggling Favorites and Watchlist Lists', () => {
    it('should add movie to favorites when not currently favorited and show toast', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const movie = { id: 101, title: 'Inception' };
      await component.addToFavorites(movie);

      expect(component.isMovieFavorite(101)).toBe(true);
      expect(mockDbService.saveMovie).toHaveBeenCalledWith(movie, 'favorites');
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Added to Favorites!');

      vi.advanceTimersByTime(3000);
      expect(component.showSuccessMessage()).toBe(false);
    });

    it('should remove movie from favorites when already favorited', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const movie = { id: 102, title: 'Interstellar' };
      await component.addToFavorites(movie);

      expect(component.isMovieFavorite(102)).toBe(false);
      expect(mockDbService.removeMovie).toHaveBeenCalledWith(102, 'isFavorite');
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Removed from Favorites');
    });

    it('should add movie to watchlist when not currently watchlisted', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const movie = { id: 101, title: 'Inception' };
      await component.addToWatchlist(movie);

      expect(component.isMovieWatchlisted(101)).toBe(true);
      expect(mockDbService.saveMovie).toHaveBeenCalledWith(movie, 'watchlist');
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Added to your Watchlist!');
    });

    it('should remove movie from watchlist when already watchlisted', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.updateLocalState(101, 'inWatchlist', true);
      const movie = { id: 101, title: 'Inception' };
      await component.addToWatchlist(movie);

      expect(component.isMovieWatchlisted(101)).toBe(false);
      expect(mockDbService.removeMovie).toHaveBeenCalledWith(101, 'inWatchlist');
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Removed from Watchlist');
    });
  });

  describe('Scenario: Rating Modal Operations and Score Submission', () => {
    it('should open and close the rating modal and reset selected movie after delay', () => {
      fixture.detectChanges();
      const movie = { id: 101, title: 'Inception' };

      component.openRatingModal(movie);
      expect(component.isRatingModalOpen()).toBe(true);
      expect(component.movieToRate()).toEqual(movie);

      component.closeRatingModal();
      expect(component.isRatingModalOpen()).toBe(false);

      vi.advanceTimersByTime(300);
      expect(component.movieToRate()).toBeNull();
    });

    it('should save new rating to database and show creation toast', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      const movie = { id: 101, title: 'Inception' };
      component.openRatingModal(movie);

      await component.setRating(8.5);

      expect(component.selectedRating()).toBe(8.5);
      expect(component.isMovieRated(101)).toBe(true);
      expect(mockDbService.saveMovie).toHaveBeenCalledWith(movie, 'rated', 8.5);
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Thanks for rating "Inception" with 8.5 stars!');
    });

    it('should update existing rating and show updated rating toast', async () => {
      fixture.detectChanges();
      await fixture.whenStable();

      component.updateLocalState(102, 'isRated', true);
      const movie = { id: 102, title: 'Interstellar' };
      component.openRatingModal(movie);

      await component.setRating(10);

      expect(mockDbService.saveMovie).toHaveBeenCalledWith(movie, 'rated', 10);
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Rating updated to 10 stars!');
    });
  });
});