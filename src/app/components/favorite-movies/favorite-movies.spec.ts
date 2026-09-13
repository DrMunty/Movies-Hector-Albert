import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed} from '@angular/core/testing';
import { FavoriteMovies } from './favorite-movies';
import { DbService } from '@services/database/database-service';
import { AuthService } from '@services/auth/auth';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { By } from '@angular/platform-browser';
import { of } from 'rxjs';
import type { UserMovie } from '@models/usermovie-interface';

describe('Feature: User Movie Lists (Favorites, Rated, Watchlist)', () => {
  let component: FavoriteMovies;
  let fixture: ComponentFixture<FavoriteMovies>;
  let mockDbService: any;
  let mockAuthService: any;

  const mockUser = {
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'http://example.com/avatar.jpg'
  };

  const mockMovies: UserMovie[] = [
    { id: 1, title: 'Inception', poster_path: '/inception.jpg', isFavorite: true, inWatchlist: false, isRated: false, addedAt: 1000 },
    { id: 2, title: 'The Matrix', poster_path: '/matrix.jpg', isFavorite: false, inWatchlist: true, isRated: false, addedAt: 2000 },
    { id: 3, title: 'Interstellar', poster_path: '/interstellar.jpg', isFavorite: false, inWatchlist: false, isRated: true, userRating: 9, addedAt: 3000 }
  ];

  beforeEach(async () => {
    mockDbService = {
      getUserMovies: vi.fn().mockReturnValue(of(mockMovies)),
      removeMovie: vi.fn().mockResolvedValue(undefined)
    };

    mockAuthService = {
      currentUser: signal(mockUser)
    };

    await TestBed.configureTestingModule({
      imports: [FavoriteMovies],
      providers: [
        provideRouter([]),
        { provide: DbService, useValue: mockDbService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FavoriteMovies);
    component = fixture.componentInstance;
  });

  describe('Scenario: Component Initialization and Data Fetching', () => {
    it('should fetch user movies and hide the loading spinner', () => {

      expect(component.isLoading()).toBe(true);

      fixture.detectChanges();

      expect(mockDbService.getUserMovies).toHaveBeenCalled();
      expect(component.allUserMovies().length).toBe(3);
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Scenario: Categorizing User Movies into Computed Signals', () => {
    it('should correctly separate movies into favorites, watchlist, and rated lists', () => {

      fixture.detectChanges();

      const favorites = component.favoriteMovies();
      const watchlist = component.watchlistMovies();
      const rated = component.ratedMovies();

      expect(favorites.length).toBe(1);
      expect(favorites[0].title).toBe('Inception');

      expect(watchlist.length).toBe(1);
      expect(watchlist[0].title).toBe('The Matrix');

      expect(rated.length).toBe(1);
      expect(rated[0].title).toBe('Interstellar');
      expect(rated[0].userRating).toBe(9);
    });
  });

  describe('Scenario: Removing a movie from the user profile', () => {
    it('should call the removeMovie method in DbService', async () => {

      fixture.detectChanges();

      const removeButtons = fixture.debugElement.queryAll(By.css('button[title="Remove Movie"]'));
      removeButtons[0].triggerEventHandler('click', new Event('click'));

      await fixture.whenStable();

      expect(mockDbService.removeMovie).toHaveBeenCalledWith(1);
    });
  });

  describe('Scenario: Handling Missing Posters', () => {
    it('should provide a placeholder image URL when poster_path is null', () => {

      const missingPath = null;
      
      const result = component.getImageUrl(missingPath);

      expect(result).toContain('via.placeholder.com');
    });

    it('should provide the full TMDB image URL when poster_path exists', () => {

      const validPath = '/inception.jpg';

      const result = component.getImageUrl(validPath);

      expect(result).toBe('https://image.tmdb.org/t/p/w500/inception.jpg');
    });
  });
});