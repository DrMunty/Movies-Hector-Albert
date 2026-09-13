import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { Movies } from './movies-list';
import { ApiService } from '@services/api-service/api-service';
import { AuthService } from '@services/auth/auth';
import { DbService } from '@services/database/database-service';
import { of } from 'rxjs';
import { signal } from '@angular/core';

describe('Feature: Movies List Component', () => {
  let component: Movies;
  let fixture: ComponentFixture<Movies>;
  let mockApiService: any;
  let mockAuthService: any;
  let mockDbService: any;

  const mockGenres = { genres: [{ id: 28, name: 'Action' }] };
  const mockMoviesResponse = { results: [{ id: 1, title: 'Inception' }], total_pages: 5 };
  const mockUserMovies = [{ id: 1, isFavorite: true, inWatchlist: false, isRated: false }];

  beforeEach(async () => {
    vi.useFakeTimers();

    mockApiService = {
      getGenres: vi.fn().mockReturnValue(of(mockGenres)),
      getMovies: vi.fn().mockReturnValue(of(mockMoviesResponse))
    };

    mockAuthService = {
      currentUser: signal({ uid: 'user1' })
    };

    mockDbService = {
      getUserMovies: vi.fn().mockReturnValue(of(mockUserMovies)),
      saveMovie: vi.fn().mockResolvedValue(undefined),
      removeMovie: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [Movies, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: DbService, useValue: mockDbService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Movies);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Scenario: Initialization and Data Loading', () => {
    it('should fetch genres, movies, and user saved movies on init', () => {
      fixture.detectChanges();

      expect(mockApiService.getGenres).toHaveBeenCalled();
      expect(mockApiService.getMovies).toHaveBeenCalled();
      expect(mockDbService.getUserMovies).toHaveBeenCalled();
      expect(component.genres().length).toBe(1);
      expect(component.moviesList().length).toBe(1);
      expect(component.totalPages()).toBe(5);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Scenario: Filter Form Toggle Behavior', () => {
    it('should disable sort_by, with_genres, and vote_average_gte when query has value', () => {
      fixture.detectChanges();
      
      const queryControl = component.filterForm.get('query');
      queryControl?.setValue('Matrix');
      
      expect(component.filterForm.get('sort_by')?.disabled).toBe(true);
      expect(component.filterForm.get('with_genres')?.disabled).toBe(true);
      expect(component.filterForm.get('vote_average_gte')?.disabled).toBe(true);
    });

    it('should enable filters when query is cleared', () => {
      fixture.detectChanges();
      
      component.filterForm.get('query')?.setValue('Matrix');
      component.filterForm.get('query')?.setValue('');
      
      expect(component.filterForm.get('sort_by')?.enabled).toBe(true);
      expect(component.filterForm.get('with_genres')?.enabled).toBe(true);
      expect(component.filterForm.get('vote_average_gte')?.enabled).toBe(true);
    });
  });

  describe('Scenario: Pagination', () => {
    it('should navigate to next and previous pages', () => {
      fixture.detectChanges();
      expect(component.currentPage()).toBe(1);

      component.nextPage();
      expect(component.currentPage()).toBe(2);
      expect(mockApiService.getMovies).toHaveBeenCalledTimes(2);

      component.prevPage();
      expect(component.currentPage()).toBe(1);
      expect(mockApiService.getMovies).toHaveBeenCalledTimes(3);
    });
  });

  describe('Scenario: State Check Helpers', () => {
    it('should correctly identify favorite, watchlisted, and rated states', () => {
      fixture.detectChanges();

      expect(component.isMovieFavorite(1)).toBe(true);
      expect(component.isMovieWatchlisted(1)).toBe(false);
      expect(component.isMovieRated(1)).toBe(false);
    });
  });

  describe('Scenario: Interactions Requiring Auth', () => {
    it('should redirect unauthenticated users to login on watchlist toggle', async () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      await component.addToWatchlist({ id: 2, title: 'Avatar' } as any);

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(mockDbService.saveMovie).not.toHaveBeenCalled();
    });

    it('should redirect unauthenticated users to login on favorite toggle', async () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      await component.addToFavorites({ id: 2, title: 'Avatar' } as any);

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(mockDbService.saveMovie).not.toHaveBeenCalled();
    });

    it('should redirect unauthenticated users to login when opening rating modal', () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.openRatingModal({ id: 2, title: 'Avatar' } as any);

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(component.isRatingModalOpen()).toBe(false);
    });
  });

  describe('Scenario: Toggling Favorites and Watchlist', () => {
    it('should remove movie from favorites if already favorited', async () => {
      fixture.detectChanges();
      const movieItem = { id: 1, title: 'Inception' } as any;

      await component.addToFavorites(movieItem);

      expect(component.isMovieFavorite(1)).toBe(false);
      expect(mockDbService.removeMovie).toHaveBeenCalledWith(1, 'isFavorite');
    });

    it('should add movie to watchlist if not watchlisted', async () => {
      fixture.detectChanges();
      const movieItem = { id: 2, title: 'Titanic' } as any;

      await component.addToWatchlist(movieItem);

      expect(component.isMovieWatchlisted(2)).toBe(true);
      expect(mockDbService.saveMovie).toHaveBeenCalledWith(movieItem, 'watchlist');
    });
  });

  describe('Scenario: Rating Modal and Submission', () => {
    it('should open and close rating modal properly', () => {
      fixture.detectChanges();
      const movieItem = { id: 1, title: 'Inception' } as any;

      component.openRatingModal(movieItem);
      expect(component.isRatingModalOpen()).toBe(true);
      expect(component.movieToRate()).toBe(movieItem);

      component.closeRatingModal();
      expect(component.isRatingModalOpen()).toBe(false);
      
      vi.advanceTimersByTime(300);
      expect(component.movieToRate()).toBeNull();
    });

    it('should set rating, update local state, and call dbService', async () => {
      fixture.detectChanges();
      const movieItem = { id: 2, title: 'Avatar' } as any;
      component.openRatingModal(movieItem);

      await component.setRating(9);

      expect(component.selectedRating()).toBe(9);
      expect(component.isMovieRated(2)).toBe(true);
      expect(mockDbService.saveMovie).toHaveBeenCalledWith(movieItem, 'rated', 9);
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Thanks for rating "Avatar" with 9 stars!');
    });
  });
});