import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';
import { TvShowDetails } from './tvshow-detail';
import { ApiService } from '@services/api-service/api-service';
import { AuthService } from '@services/auth/auth';
import { DbService } from '@services/database/database-service';

describe('Feature: TV Show Details Component', () => {
  let component: TvShowDetails;
  let fixture: ComponentFixture<TvShowDetails>;
  let mockApiService: any;
  let mockAuthService: any;
  let mockDbService: any;
  let paramMapSubject: BehaviorSubject<any>;

  const mockTvShow = {
    id: 1399,
    name: 'Game of Thrones',
    overview: 'Nine noble families fight for control over the lands of Westeros.',
    first_air_date: '2011-04-17',
    number_of_seasons: 8,
    vote_average: 8.4,
    backdrop_path: '/got-bg.jpg',
    poster_path: '/got-poster.jpg',
    genres: [{ id: 10765, name: 'Sci-Fi & Fantasy' }],
    created_by: [
      { id: 9813, name: 'David Benioff' },
      { id: 228068, name: 'D.B. Weiss' }
    ],
    credits: {
      cast: [
        { id: 1223786, name: 'Emilia Clarke', character: 'Daenerys Targaryen', profile_path: '/emilia.jpg' }
      ]
    }
  };

  const mockUserMovies = [
    { id: 1399, isFavorite: true, inWatchlist: false }
  ];

  beforeEach(async () => {
    vi.useFakeTimers();

    paramMapSubject = new BehaviorSubject({
      get: (key: string) => (key === 'id' ? '1399' : null)
    });

    mockApiService = {
      getTvShowDetails: vi.fn().mockReturnValue(of(mockTvShow))
    };

    mockAuthService = {
      currentUser: signal({ uid: 'user_1' })
    };

    mockDbService = {
      getUserMovies: vi.fn().mockReturnValue(of(mockUserMovies)),
      saveMovie: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [TvShowDetails],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: DbService, useValue: mockDbService },
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TvShowDetails);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Scenario: Initialization and Data Loading', () => {
    it('should fetch TV show details and load user list state on init', () => {
      fixture.detectChanges();

      expect(mockApiService.getTvShowDetails).toHaveBeenCalledWith(1399);
      expect(mockDbService.getUserMovies).toHaveBeenCalled();
      expect(component.tvShow()?.name).toBe('Game of Thrones');
      expect(component.isLoading()).toBe(false);
      expect(component.isFavorited()).toBe(true);
      expect(component.isWatchlisted()).toBe(false);
    });

    it('should handle API errors by resetting loading state', () => {
      mockApiService.getTvShowDetails.mockReturnValueOnce(throwError(() => new Error('API Error')));

      fixture.detectChanges();

      expect(component.tvShow()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Scenario: Helper Methods', () => {
    it('should return comma separated creators or Desconocido', () => {
      fixture.detectChanges();
      expect(component.getCreator()).toBe('David Benioff, D.B. Weiss');

      component.tvShow.set({ ...mockTvShow, created_by: [] });
      expect(component.getCreator()).toBe('Desconocido');
    });

    it('should format image URL or fallback to placeholder', () => {
      expect(component.getImageUrl('/path.jpg')).toBe('https://image.tmdb.org/t/p/w500/path.jpg');
      expect(component.getImageUrl(null)).toBe('assets/images/placeholder.png');
    });
  });

  describe('Scenario: Authentication Redirections', () => {
    it('should redirect unauthenticated user to login on watchlist click', async () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      await component.addToWatchlist(mockTvShow);

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(mockDbService.saveMovie).not.toHaveBeenCalled();
    });

    it('should redirect unauthenticated user to login on favorite click', async () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      await component.addToFavorites(mockTvShow);

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(mockDbService.saveMovie).not.toHaveBeenCalled();
    });

    it('should redirect unauthenticated user to login on open rating modal', () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();
      const router = TestBed.inject(Router);
      const navigateSpy = vi.spyOn(router, 'navigate');

      component.openRatingModal(mockTvShow);

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
      expect(component.isRatingModalOpen()).toBe(false);
    });
  });

  describe('Scenario: Saving TV Shows to User Lists', () => {
    it('should add show to watchlist, format payload with title, and show toast', async () => {
      fixture.detectChanges();

      await component.addToWatchlist(mockTvShow);

      expect(component.isWatchlisted()).toBe(true);
      expect(mockDbService.saveMovie).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1399, title: 'Game of Thrones' }),
        'watchlist'
      );
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Added to your Watchlist!');

      vi.advanceTimersByTime(3000);
      expect(component.showSuccessMessage()).toBe(false);
    });

    it('should add show to favorites, format payload with title, and show toast', async () => {
      fixture.detectChanges();

      await component.addToFavorites(mockTvShow);

      expect(component.isFavorited()).toBe(true);
      expect(mockDbService.saveMovie).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1399, title: 'Game of Thrones' }),
        'favorites'
      );
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Added to Favorites!');
    });
  });

  describe('Scenario: Rating Modal and TV Show Rating Submission', () => {
    it('should open and close the rating modal', () => {
      fixture.detectChanges();

      component.openRatingModal(mockTvShow);
      expect(component.isRatingModalOpen()).toBe(true);
      expect(component.showToRate()?.name).toBe('Game of Thrones');

      component.closeRatingModal();
      expect(component.isRatingModalOpen()).toBe(false);

      vi.advanceTimersByTime(300);
      expect(component.showToRate()).toBeNull();
    });

    it('should submit rating and save payload formatted with title', async () => {
      fixture.detectChanges();
      component.openRatingModal(mockTvShow);

      await component.setRating(9.5);

      expect(component.selectedRating()).toBe(9.5);
      expect(component.isRatingModalOpen()).toBe(false);
      expect(mockDbService.saveMovie).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1399, title: 'Game of Thrones' }),
        'rated',
        9.5
      );
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Thanks for rating "Game of Thrones" with 9.5 stars!');
    });
  });
});