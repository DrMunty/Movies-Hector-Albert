import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { of } from 'rxjs';
import { Navbar } from './navbar';
import { ApiService } from '@services/api-service/api-service';
import { AuthService } from '@services/auth/auth';

describe('Feature: Navbar Component', () => {
  let component: Navbar;
  let fixture: ComponentFixture<Navbar>;
  let mockApiService: any;
  let mockAuthService: any;

  const mockUser = {
    displayName: 'Test User',
    email: 'test@example.com',
    photoURL: 'https://example.com/avatar.jpg'
  };

  const mockSearchResults = {
    results: [
      { id: 1, media_type: 'movie', title: 'Inception', release_date: '2010-07-16' },
      { id: 2, media_type: 'tv', name: 'Breaking Bad', first_air_date: '2008-01-20' },
      { id: 3, media_type: 'person', name: 'Christopher Nolan', known_for_department: 'Directing' },
      { id: 4, media_type: 'person', name: 'Leonardo DiCaprio', known_for_department: 'Acting' },
      { id: 5, media_type: 'movie', title: 'Interstellar', release_date: '2014-11-05' },
      { id: 6, media_type: 'movie', title: 'Tenet', release_date: '2020-08-26' }
    ]
  };

  beforeEach(async () => {
    vi.useFakeTimers();

    mockApiService = {
      searchMulti: vi.fn().mockReturnValue(of(mockSearchResults))
    };

    mockAuthService = {
      currentUser: signal(mockUser),
      logout: vi.fn().mockResolvedValue(undefined)
    };

    await TestBed.configureTestingModule({
      imports: [Navbar, ReactiveFormsModule],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: mockApiService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Navbar);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Scenario: Search Input and Debounced Autocomplete', () => {
    it('should trigger searchMulti and limit results to top 5 after debounce', () => {
      fixture.detectChanges();

      component.searchInput.setValue('Matrix');
      vi.advanceTimersByTime(300);

      expect(mockApiService.searchMulti).toHaveBeenCalledWith('Matrix');
      expect(component.searchResults().length).toBe(5);
      expect(component.searchResults()[0].title).toBe('Inception');
    });

    it('should reset search results when query is empty or whitespace', () => {
      fixture.detectChanges();

      component.searchInput.setValue('Inception');
      vi.advanceTimersByTime(300);
      expect(component.searchResults().length).toBe(5);

      component.searchInput.setValue('   ');
      vi.advanceTimersByTime(300);
      expect(component.searchResults().length).toBe(0);
    });

    it('should clear input and search results when closeSearch is called', () => {
      fixture.detectChanges();

      component.searchResults.set(mockSearchResults.results.slice(0, 3));
      component.searchInput.setValue('test');

      component.closeSearch();

      expect(component.searchInput.value).toBe('');
      expect(component.searchResults().length).toBe(0);
    });
  });

  describe('Scenario: Profile Menu and Authentication States', () => {
    it('should toggle profile menu visibility', () => {
      fixture.detectChanges();
      expect(component.isProfileMenuOpen()).toBe(false);

      component.toggleProfileMenu();
      expect(component.isProfileMenuOpen()).toBe(true);

      component.toggleProfileMenu();
      expect(component.isProfileMenuOpen()).toBe(false);
    });

    it('should close profile menu and call logout on authService', async () => {
      fixture.detectChanges();
      component.isProfileMenuOpen.set(true);

      await component.logout();

      expect(component.isProfileMenuOpen()).toBe(false);
      expect(mockAuthService.logout).toHaveBeenCalled();
    });

    it('should render profile avatar when user is logged in', () => {
      fixture.detectChanges();

      const img = fixture.nativeElement.querySelector('img[alt="Profile Avatar"]');
      expect(img).not.toBeNull();
      expect(img.getAttribute('src')).toBe(mockUser.photoURL);
    });

    it('should render login and sign up links when user is not logged in', () => {
      mockAuthService.currentUser.set(null);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('a');
      const linkTexts = Array.from(buttons).map((btn: any) => btn.textContent.trim());

      expect(linkTexts).toContain('Log In');
      expect(linkTexts).toContain('Sign Up');
      expect(fixture.nativeElement.querySelector('img[alt="Profile Avatar"]')).toBeNull();
    });
  });
});