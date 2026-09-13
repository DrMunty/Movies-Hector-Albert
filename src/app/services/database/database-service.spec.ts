import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { DbService } from './database-service';
import { AuthService } from '../auth/auth';
import { 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  collectionGroup, 
  getDocs 
} from '@angular/fire/firestore';
import type { UserMovie } from '../../models/usermovie-interface';

vi.mock('@angular/fire/firestore', () => ({
  Firestore: class {},
  collection: vi.fn(),
  doc: vi.fn(),
  setDoc: vi.fn(),
  deleteDoc: vi.fn(),
  onSnapshot: vi.fn(),
  collectionGroup: vi.fn(),
  getDocs: vi.fn()
}));

describe('Feature: Database Service (Firestore Persistence)', () => {
  let service: DbService;
  let mockAuthService: { currentUser: ReturnType<typeof signal<any>> };
  let mockFirestoreInstance: Firestore;

  const mockUser = { uid: 'user_123' };
  const mockMovie = {
    id: 42,
    title: 'Interstellar',
    poster_path: '/poster.jpg'
  };

  beforeEach(() => {
    mockFirestoreInstance = {} as Firestore;
    mockAuthService = {
      currentUser: signal<any>(mockUser)
    };

    vi.mocked(doc).mockReturnValue({} as any);
    vi.mocked(collection).mockReturnValue({} as any);
    vi.mocked(collectionGroup).mockReturnValue({} as any);
    vi.mocked(setDoc).mockResolvedValue(undefined);
    vi.mocked(deleteDoc).mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        DbService,
        { provide: Firestore, useValue: mockFirestoreInstance },
        { provide: AuthService, useValue: mockAuthService }
      ]
    });

    service = TestBed.inject(DbService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Scenario: Saving Movies to Lists and Ratings', () => {
    it('should not perform any operation if user is not authenticated', async () => {
      mockAuthService.currentUser.set(null);

      await service.saveMovie(mockMovie, 'favorites');

      expect(doc).not.toHaveBeenCalled();
      expect(setDoc).not.toHaveBeenCalled();
    });

    it('should save movie to favorites list with isFavorite flag set to true', async () => {
      const mockDocRef = { path: 'users/user_123/movies/42' };
      vi.mocked(doc).mockReturnValueOnce(mockDocRef as any);

      await service.saveMovie(mockMovie, 'favorites');

      expect(doc).toHaveBeenCalledWith(mockFirestoreInstance, 'users/user_123/movies/42');
      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        expect.objectContaining({
          id: 42,
          title: 'Interstellar',
          poster_path: '/poster.jpg',
          isFavorite: true,
          addedAt: expect.any(Number)
        }),
        { merge: true }
      );
    });

    it('should save movie to watchlist with inWatchlist flag set to true', async () => {
      await service.saveMovie(mockMovie, 'watchlist');

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          inWatchlist: true
        }),
        { merge: true }
      );
    });

    it('should save movie rating with isRated flag and numeric userRating', async () => {
      await service.saveMovie(mockMovie, 'rated', 9.5);

      expect(setDoc).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          isRated: true,
          userRating: 9.5
        }),
        { merge: true }
      );
    });
  });

  describe('Scenario: Streaming User Saved Movies', () => {
    it('should return empty list when no authenticated user is present', async () => {
      mockAuthService.currentUser.set(null);

      return new Promise<void>((resolve) => {
        service.getUserMovies().subscribe((movies) => {
          expect(movies).toEqual([]);
          resolve();
        });
      });
    });

    it('should subscribe to Firestore collection snapshot and emit mapped movie documents', async () => {
      const expectedMovies: UserMovie[] = [
        { id: 42, title: 'Interstellar', isFavorite: true } as UserMovie
      ];

      vi.mocked(onSnapshot).mockImplementation((_ref: any, onNext: any) => {
        onNext({
          docs: [
            { data: () => expectedMovies[0] }
          ]
        });
        return vi.fn();
      });

      return new Promise<void>((resolve) => {
        service.getUserMovies().subscribe((movies) => {
          expect(collection).toHaveBeenCalledWith(mockFirestoreInstance, 'users/user_123/movies');
          expect(movies).toEqual(expectedMovies);
          resolve();
        });
      });
    });

    it('should propagate error when onSnapshot encounters an error', async () => {
      const mockError = new Error('Permission denied');

      vi.mocked(onSnapshot).mockImplementation((_ref: any, _onNext: any, onError: any) => {
        onError(mockError);
        return vi.fn();
      });

      return new Promise<void>((resolve) => {
        service.getUserMovies().subscribe({
          next: () => {},
          error: (err) => {
            expect(err).toBe(mockError);
            resolve();
          }
        });
      });
    });
  });

  describe('Scenario: Removing Movies or Resetting Flags', () => {
    it('should return early when user is not authenticated', async () => {
      mockAuthService.currentUser.set(null);

      await service.removeMovie(42);

      expect(deleteDoc).not.toHaveBeenCalled();
      expect(setDoc).not.toHaveBeenCalled();
    });

    it('should delete the entire document when no field parameter is provided', async () => {
      const mockDocRef = { path: 'users/user_123/movies/42' };
      vi.mocked(doc).mockReturnValueOnce(mockDocRef as any);

      await service.removeMovie(42);

      expect(doc).toHaveBeenCalledWith(mockFirestoreInstance, 'users/user_123/movies/42');
      expect(deleteDoc).toHaveBeenCalledWith(mockDocRef);
    });

    it('should merge specific field update as false when field parameter is specified', async () => {
      const mockDocRef = { path: 'users/user_123/movies/42' };
      vi.mocked(doc).mockReturnValueOnce(mockDocRef as any);

      await service.removeMovie(42, 'isFavorite');

      expect(setDoc).toHaveBeenCalledWith(
        mockDocRef,
        { isFavorite: false },
        { merge: true }
      );
    });
  });

  describe('Scenario: Calculating Global Community Rankings', () => {
    it('should aggregate favorite counts, average ratings, and filter out items with no engagements', async () => {
      const mockDocs = [
        { data: () => ({ id: 1, title: 'Matrix', isFavorite: true, isRated: true, userRating: 8 }) },
        { data: () => ({ id: 1, title: 'Matrix', isFavorite: true, isRated: true, userRating: 10 }) },
        { data: () => ({ id: 2, title: 'Memento', isFavorite: false, isRated: true, userRating: 7 }) },
        { data: () => ({ id: 3, title: 'Untouched', isFavorite: false, isRated: false }) }
      ];

      vi.mocked(getDocs).mockResolvedValueOnce({
        forEach: (callback: (doc: any) => void) => mockDocs.forEach(callback)
      } as any);

      const rankings = await service.getGlobalRankings();

      expect(collectionGroup).toHaveBeenCalledWith(mockFirestoreInstance, 'movies');
      expect(rankings.length).toBe(2);

      const matrix = rankings.find((m) => m.id === 1);
      expect(matrix).toEqual({
        id: 1,
        title: 'Matrix',
        favoriteCount: 2,
        ratingSum: 18,
        ratingCount: 2,
        averageRating: 9
      });

      const memento = rankings.find((m) => m.id === 2);
      expect(memento).toEqual({
        id: 2,
        title: 'Memento',
        favoriteCount: 0,
        ratingSum: 7,
        ratingCount: 1,
        averageRating: 7
      });
    });
  });
});