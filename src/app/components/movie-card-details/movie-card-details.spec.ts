import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCardDetails } from './movie-card-details';
import { ApiService } from '@services/api-service/api-service';
import { AuthService } from '@services/auth/auth';
import { DbService } from '@services/database/database-service';
import { ActivatedRoute, Router } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { signal } from '@angular/core';

describe('Feature: Movie Card Details Component', () => {
  let component: MovieCardDetails;
  let fixture: ComponentFixture<MovieCardDetails>;
  let mockApiService: any;
  let mockAuthService: any;
  let mockDbService: any;
  let mockRouter: any;
  
  const paramMapSubject = new BehaviorSubject({ get: (key: string) => '123' });

  const mockMovieDetail = {
    id: 123,
    title: 'The Matrix',
    poster_path: '/matrix.jpg',
    backdrop_path: '/matrix-bg.jpg',
    release_date: '1999-03-31',
    runtime: 136,
    vote_average: 8.7,
    overview: 'Neo learns the truth.',
    genres: [{ id: 1, name: 'Sci-Fi' }],
    credits: {
      crew: [{ name: 'Lana Wachowski', job: 'Director', id: 99 }],
      cast: [{ id: 1, name: 'Keanu Reeves', character: 'Neo', profile_path: '/keanu.jpg' }]
    }
  };

  const mockUserMovies = [
    { id: 123, isFavorite: true, inWatchlist: false, isRated: true }
  ];

  beforeEach(async () => {
    vi.useFakeTimers();

    mockApiService = {
      getMovieDetails: vi.fn().mockReturnValue(of(mockMovieDetail))
    };

    mockAuthService = {
      currentUser: signal({ uid: 'user123' })
    };

    mockDbService = {
      getUserMovies: vi.fn().mockReturnValue(of(mockUserMovies)),
      saveMovie: vi.fn().mockResolvedValue(undefined),
      removeMovie: vi.fn().mockResolvedValue(undefined)
    };

    mockRouter = {
      navigate: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [MovieCardDetails],
      providers: [
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: DbService, useValue: mockDbService },
        { provide: Router, useValue: mockRouter },
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCardDetails);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Scenario: Initialization and Data Fetching', () => {
    it('should fetch movie details and check saved status on init', () => {
      fixture.detectChanges();

      expect(mockApiService.getMovieDetails).toHaveBeenCalledWith(123);
      expect(mockDbService.getUserMovies).toHaveBeenCalled();
      
      expect(component.movie()?.title).toBe('The Matrix');
      expect(component.isLoading()).toBe(false);
      expect(component.isFavorited()).toBe(true);
      expect(component.isWatchlisted()).toBe(false);
      expect(component.isRated()).toBe(true);
    });

    it('should correctly identify the director from the crew list', () => {
      fixture.detectChanges();
      
      const director = component.getDirector();
      expect(director.name).toBe('Lana Wachowski');
      expect(director.job).toBe('Director');
    });

    it('should return correct image URLs or placeholders', () => {
      fixture.detectChanges();
      
      expect(component.getImageUrl('/test.jpg')).toBe('https://image.tmdb.org/t/p/w500/test.jpg');
      expect(component.getImageUrl(null)).toBe('https://via.placeholder.com/500x750?text=No+Image');
    });
  });

  describe('Scenario: User Interactions Requiring Authentication', () => {
    it('should redirect to login if an unauthenticated user tries to add to watchlist', async () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();

      await component.addToWatchlist(mockMovieDetail as any);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(mockDbService.saveMovie).not.toHaveBeenCalled();
    });

    it('should redirect to login if an unauthenticated user tries to rate', () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();

      component.openRatingModal(mockMovieDetail as any);

      expect(mockRouter.navigate).toHaveBeenCalledWith(['/login']);
      expect(component.isRatingModalOpen()).toBe(false);
    });
  });

  describe('Scenario: Toggling Movie Lists (Favorites and Watchlist)', () => {
    it('should add a movie to favorites and show toast if not favorited', async () => {
      mockDbService.getUserMovies.mockReturnValueOnce(of([]));
      fixture.detectChanges();
      
      expect(component.isFavorited()).toBe(false);

      await component.addToFavorites(mockMovieDetail as any);

      expect(component.isFavorited()).toBe(true);
      expect(mockDbService.saveMovie).toHaveBeenCalledWith(mockMovieDetail, 'favorites');
      
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Added to Favorites!');
      
      vi.advanceTimersByTime(3000);
      expect(component.showSuccessMessage()).toBe(false);
    });

    it('should remove a movie from watchlist and show toast if already watchlisted', async () => {
      mockDbService.getUserMovies.mockReturnValueOnce(of([{ id: 123, inWatchlist: true }]));
      fixture.detectChanges();
      
      expect(component.isWatchlisted()).toBe(true);

      await component.addToWatchlist(mockMovieDetail as any);

      expect(component.isWatchlisted()).toBe(false);
      expect(mockDbService.removeMovie).toHaveBeenCalledWith(123, 'inWatchlist');
      
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Removed from Watchlist');
    });
  });

  describe('Scenario: Rating a Movie', () => {
    it('should open and close the rating modal', () => {
      fixture.detectChanges();
      
      component.openRatingModal(mockMovieDetail as any);
      expect(component.isRatingModalOpen()).toBe(true);
      expect(component.movieToRate()?.title).toBe('The Matrix');

      component.closeRatingModal();
      expect(component.isRatingModalOpen()).toBe(false);
      
      vi.advanceTimersByTime(300);
      expect(component.movieToRate()).toBeNull();
    });

    it('should set a new rating, save to DB, and display toast', async () => {
      mockDbService.getUserMovies.mockReturnValueOnce(of([]));
      fixture.detectChanges();
      
      component.openRatingModal(mockMovieDetail as any);
      await component.setRating(8.5);

      expect(component.selectedRating()).toBe(8.5);
      expect(component.isRated()).toBe(true);
      expect(component.isRatingModalOpen()).toBe(false);
      
      expect(mockDbService.saveMovie).toHaveBeenCalledWith(mockMovieDetail, 'rated', 8.5);
      
      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Thanks for rating "The Matrix" with 8.5 stars!');
    });

    it('should update an existing rating and display different toast', async () => {
      fixture.detectChanges(); 
      
      component.openRatingModal(mockMovieDetail as any);
      await component.setRating(9);

      expect(component.showSuccessMessage()).toBe(true);
      expect(component.successMessageText()).toBe('Rating updated to 9 stars!');
    });
  });
});