import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCard } from './movie-card';
import type { Movie } from '@models/movie-interface';

describe('Feature: Movie Card Component', () => {
  let component: MovieCard;
  let fixture: ComponentFixture<MovieCard>;

  const mockMovie: Movie = {
    id: 1,
    title: 'Interstellar',
    poster_path: '/interstellar.jpg',
    backdrop_path: '/bg.jpg',
    release_date: '2014-11-05',
    original_language: 'en',
    vote_average: 8.6,
    vote_count: 20000,
    overview: 'Space movie',
    genre_ids: [1, 2],
    popularity: 100,
    adult: false,
    video: false,
    original_title: 'Interstellar'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCard]
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCard);
    component = fixture.componentInstance;
    
    fixture.componentRef.setInput('movie', mockMovie);
    fixture.detectChanges();
  });

  describe('Scenario: Rendering Movie Information', () => {
    it('should display the correct poster URL when poster_path exists', () => {
      expect(component.posterUrl).toBe('https://image.tmdb.org/t/p/w500/interstellar.jpg');
    });

    it('should display a placeholder URL when poster_path is missing', () => {
      fixture.componentRef.setInput('movie', { ...mockMovie, poster_path: null });
      fixture.detectChanges();
      expect(component.posterUrl).toBe('https://via.placeholder.com/500x750?text=No+Poster');
    });
  });

  describe('Scenario: User Interactions and Event Emission', () => {
    it('should emit favoriteMovie and stop propagation when favorite button is clicked', () => {
      const emitSpy = vi.spyOn(component.favoriteMovie, 'emit');
      const eventMock = new Event('click');
      const stopPropagationSpy = vi.spyOn(eventMock, 'stopPropagation');
      const preventDefaultSpy = vi.spyOn(eventMock, 'preventDefault');

      component.onFavoriteClick(eventMock);

      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit rateMovie and stop propagation when rate button is clicked', () => {
      const emitSpy = vi.spyOn(component.rateMovie, 'emit');
      const eventMock = new Event('click');
      const stopPropagationSpy = vi.spyOn(eventMock, 'stopPropagation');
      
      component.onRateClick(eventMock);

      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalled();
    });

    it('should emit watchLaterMovie and stop propagation when watch later button is clicked', () => {
      const emitSpy = vi.spyOn(component.watchLaterMovie, 'emit');
      const eventMock = new Event('click');
      const preventDefaultSpy = vi.spyOn(eventMock, 'preventDefault');

      component.onWatchLaterClick(eventMock);

      expect(preventDefaultSpy).toHaveBeenCalled();
      expect(emitSpy).toHaveBeenCalled();
    });
  });

  describe('Scenario: Dynamic CSS Classes Based on Inputs', () => {
    it('should apply active classes when movie is marked as favorite, rated, and watchlisted', () => {
      fixture.componentRef.setInput('isFavorite', true);
      fixture.componentRef.setInput('isRated', true);
      fixture.componentRef.setInput('isWatchlisted', true);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons[0].className).toContain('text-pink-500');
      expect(buttons[1].className).toContain('text-amber-400');
      expect(buttons[2].className).toContain('text-blue-500');
    });

    it('should apply default classes when movie is not marked in any list', () => {
      fixture.componentRef.setInput('isFavorite', false);
      fixture.componentRef.setInput('isRated', false);
      fixture.componentRef.setInput('isWatchlisted', false);
      fixture.detectChanges();

      const buttons = fixture.nativeElement.querySelectorAll('button');
      expect(buttons[0].className).toContain('text-white');
      expect(buttons[1].className).toContain('text-[#5799ef]');
      expect(buttons[2].className).toContain('text-[#5799ef]');
    });
  });
});