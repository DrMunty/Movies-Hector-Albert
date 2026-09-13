import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { provideRouter, Router } from '@angular/router';
import { signal } from '@angular/core';
import { UserProfile } from './user-profile';
import { AuthService } from '@services/auth/auth';
import * as firebaseAuth from 'firebase/auth';

vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  updateProfile: vi.fn()
}));

describe('Feature: User Profile Component', () => {
  let component: UserProfile;
  let fixture: ComponentFixture<UserProfile>;
  let mockAuthService: any;
  let mockRouter: Router;
  let mockFirebaseUser: any;

  const mockUser = {
    displayName: 'Test User',
    photoURL: 'https://example.com/avatar.jpg'
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    mockFirebaseUser = {
      displayName: 'Test User',
      photoURL: 'https://example.com/avatar.jpg'
    };

    vi.mocked(firebaseAuth.getAuth).mockReturnValue({
      currentUser: mockFirebaseUser
    } as any);

    vi.mocked(firebaseAuth.updateProfile).mockResolvedValue(undefined);

    mockAuthService = {
      currentUser: signal(mockUser)
    };

    await TestBed.configureTestingModule({
      imports: [UserProfile, FormsModule],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    mockRouter = TestBed.inject(Router);
    fixture = TestBed.createComponent(UserProfile);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('Scenario: Initialization and Authentication Check', () => {
    it('should initialize signals with user profile data when authenticated', () => {
      fixture.detectChanges();

      expect(component.displayName()).toBe('Test User');
      expect(component.photoURL()).toBe('https://example.com/avatar.jpg');
      expect(component.isLoading()).toBe(false);
      expect(component.showSuccess()).toBe(false);
    });

    it('should redirect to /login if there is no authenticated user', () => {
      mockAuthService.currentUser.set(null);
      const navigateSpy = vi.spyOn(mockRouter, 'navigate');

      fixture.detectChanges();

      expect(navigateSpy).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('Scenario: Avatar Preview Generation and Fallback', () => {
    it('should return user photo URL if present', () => {
      fixture.detectChanges();
      component.photoURL.set('https://custom-image.com/pic.png');

      expect(component.getPreviewImage()).toBe('https://custom-image.com/pic.png');
    });

    it('should return dicebear placeholder when photoURL is empty', () => {
      fixture.detectChanges();
      component.photoURL.set('');

      expect(component.getPreviewImage()).toBe('https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder');
    });
  });

  describe('Scenario: Saving Profile Changes', () => {
    it('should call updateProfile with updated values and show success indicator', async () => {
      fixture.detectChanges();
      component.displayName.set('New Name');
      component.photoURL.set('https://example.com/new.png');

      await component.saveProfile();

      expect(firebaseAuth.updateProfile).toHaveBeenCalledWith(mockFirebaseUser, {
        displayName: 'New Name',
        photoURL: 'https://example.com/new.png'
      });
      expect(component.showSuccess()).toBe(true);
      expect(component.isLoading()).toBe(false);
    });

    it('should handle update errors gracefully and reset loading indicator', async () => {
      vi.mocked(firebaseAuth.updateProfile).mockRejectedValueOnce(new Error('Firebase Error'));
      fixture.detectChanges();

      await component.saveProfile();

      expect(component.showSuccess()).toBe(false);
      expect(component.isLoading()).toBe(false);
    });
  });
});