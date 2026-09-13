import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  signOut, 
  user,
  User,
  GoogleAuthProvider
} from '@angular/fire/auth';

vi.mock('@angular/fire/auth', () => {
  return {
    Auth: class {},
    GoogleAuthProvider: class {},
    signInWithEmailAndPassword: vi.fn(),
    createUserWithEmailAndPassword: vi.fn(),
    signInWithPopup: vi.fn(),
    signOut: vi.fn(),
    user: vi.fn()
  };
});

describe('Feature: Authentication Service', () => {
  let service: AuthService;
  let router: Router;
  let mockAuthInstance: Auth;
  let userSubject: BehaviorSubject<User | null>;

  const mockUser = {
    uid: 'user123',
    email: 'user@example.com'
  } as User;

  beforeEach(() => {
    userSubject = new BehaviorSubject<User | null>(mockUser);
    vi.mocked(user).mockReturnValue(userSubject.asObservable());

    mockAuthInstance = {} as Auth;

    vi.mocked(signInWithEmailAndPassword).mockResolvedValue({} as any);
    vi.mocked(createUserWithEmailAndPassword).mockResolvedValue({} as any);
    vi.mocked(signInWithPopup).mockResolvedValue({} as any);
    vi.mocked(signOut).mockResolvedValue(undefined);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        AuthService,
        { provide: Auth, useValue: mockAuthInstance }
      ]
    });

    router = TestBed.inject(Router);
    service = TestBed.inject(AuthService);
  });

  describe('Scenario: Initialization and Auth State Tracking', () => {
    it('should set currentUser signal from the user observable subscription', () => {
      expect(user).toHaveBeenCalledWith(mockAuthInstance);
      expect(service.currentUser()).toEqual(mockUser);

      userSubject.next(null);
      expect(service.currentUser()).toBeNull();
    });
  });

  describe('Scenario: Email and Password Login', () => {
    it('should call signInWithEmailAndPassword and redirect to root', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      await service.login('test@test.com', 'password123');

      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(mockAuthInstance, 'test@test.com', 'password123');
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Scenario: Account Registration', () => {
    it('should call createUserWithEmailAndPassword and redirect to root', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      await service.register('new@test.com', 'secretpass');

      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(mockAuthInstance, 'new@test.com', 'secretpass');
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Scenario: Google Sign-In Authentication', () => {
    it('should invoke signInWithPopup with GoogleAuthProvider and redirect to root', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      await service.loginWithGoogle();

      expect(signInWithPopup).toHaveBeenCalledWith(mockAuthInstance, expect.any(GoogleAuthProvider));
      expect(navigateSpy).toHaveBeenCalledWith(['/']);
    });
  });

  describe('Scenario: Session Sign-Out', () => {
    it('should trigger signOut and redirect user to /login route', async () => {
      const navigateSpy = vi.spyOn(router, 'navigate');

      await service.logout();

      expect(signOut).toHaveBeenCalledWith(mockAuthInstance);
      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });
});