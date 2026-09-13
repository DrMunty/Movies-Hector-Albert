import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { PersonDetails } from './person-detail';
import { ApiService } from '@services/api-service/api-service';
import type { PersonDetail } from '@models/person-interface';

describe('Feature: Person Details Component', () => {
  let component: PersonDetails;
  let fixture: ComponentFixture<PersonDetails>;
  let mockApiService: any;
  let paramMapSubject: BehaviorSubject<any>;

  const mockPersonActor: PersonDetail = {
    id: 101,
    name: 'Cillian Murphy',
    biography: 'Irish actor known for Peaky Blinders and Oppenheimer.',
    birthday: '1976-05-25',
    place_of_birth: 'Douglas, Ireland',
    popularity: 98.4,
    profile_path: '/cillian.jpg',
    known_for_department: 'Acting',
    combined_credits: {
      cast: [
        {
          id: 1,
          title: 'Oppenheimer',
          poster_path: '/oppenheimer.jpg',
          backdrop_path: '/oppenheimer-bg.jpg',
          popularity: 150,
          vote_average: 8.9,
          media_type: 'movie'
        } as any,
        {
          id: 2,
          name: 'Peaky Blinders',
          poster_path: '/peaky.jpg',
          backdrop_path: null,
          popularity: 120,
          vote_average: 8.8,
          media_type: 'tv'
        } as any,
        {
          id: 3,
          title: 'No Poster Movie',
          poster_path: null,
          backdrop_path: null,
          popularity: 200,
          vote_average: 7.0,
          media_type: 'movie'
        } as any
      ],
      crew: []
    }
  } as any;

  const mockPersonDirector: PersonDetail = {
    id: 202,
    name: 'Christopher Nolan',
    biography: 'British-American film director.',
    birthday: '1970-07-30',
    place_of_birth: 'London, England',
    popularity: 95.2,
    profile_path: '/nolan.jpg',
    known_for_department: 'Directing',
    combined_credits: {
      crew: [
        {
          id: 10,
          title: 'Inception',
          job: 'Director',
          poster_path: '/inception.jpg',
          backdrop_path: '/inception-bg.jpg',
          popularity: 180,
          vote_average: 8.8,
          media_type: 'movie'
        } as any,
        {
          id: 11,
          title: 'Interstellar - Producer',
          job: 'Producer',
          poster_path: '/interstellar.jpg',
          backdrop_path: null,
          popularity: 190,
          vote_average: 8.6,
          media_type: 'movie'
        } as any
      ],
      cast: []
    }
  } as any;

  beforeEach(async () => {
    paramMapSubject = new BehaviorSubject({
      get: (key: string) => (key === 'id' ? '101' : null)
    });

    mockApiService = {
      getPersonDetails: vi.fn().mockReturnValue(of(mockPersonActor))
    };

    await TestBed.configureTestingModule({
      imports: [PersonDetails],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: mockApiService },
        { provide: ActivatedRoute, useValue: { paramMap: paramMapSubject.asObservable() } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PersonDetails);
    component = fixture.componentInstance;
  });

  describe('Scenario: Component Initialization and Data Loading', () => {
    it('should fetch person details matching route id and update signals', () => {
      fixture.detectChanges();

      expect(mockApiService.getPersonDetails).toHaveBeenCalledWith(101);
      expect(component.person()?.name).toBe('Cillian Murphy');
      expect(component.isLoading()).toBe(false);
    });

    it('should handle API errors by stopping the loading indicator', () => {
      mockApiService.getPersonDetails.mockReturnValueOnce(throwError(() => new Error('API Error')));

      fixture.detectChanges();

      expect(component.person()).toBeNull();
      expect(component.isLoading()).toBe(false);
    });
  });

  describe('Scenario: Known For List and Hero Backdrop Computations', () => {
    it('should filter out media without poster and sort by popularity for actors', () => {
      fixture.detectChanges();

      const knownFor = component.knownForList();
      expect(knownFor.length).toBe(2);
      expect(component.getMediaTitle(knownFor[0])).toBe('Oppenheimer');
      expect(component.getMediaTitle(knownFor[1])).toBe('Peaky Blinders');
      expect(component.heroBackdrop()).toBe('/oppenheimer-bg.jpg');
    });

    it('should filter directing crew jobs for directors and set backdrop', () => {
      mockApiService.getPersonDetails.mockReturnValueOnce(of(mockPersonDirector));

      fixture.detectChanges();

      const knownFor = component.knownForList();
      expect(knownFor.length).toBe(1);
      expect(component.getMediaTitle(knownFor[0])).toBe('Inception');
      expect(component.heroBackdrop()).toBe('/inception-bg.jpg');
    });

    it('should prioritize explicit known_for property if present on person data', () => {
      const personWithExplicitKnownFor = {
        ...mockPersonActor,
        known_for: [
          {
            id: 99,
            title: 'Explicit Movie',
            poster_path: '/explicit.jpg',
            backdrop_path: '/explicit-bg.jpg',
            popularity: 300
          } as any
        ]
      };
      mockApiService.getPersonDetails.mockReturnValueOnce(of(personWithExplicitKnownFor));

      fixture.detectChanges();

      const knownFor = component.knownForList();
      expect(knownFor.length).toBe(1);
      expect(component.getMediaTitle(knownFor[0])).toBe('Explicit Movie');
    });

    it('should return empty list and null backdrop when person has no data', () => {
      expect(component.knownForList()).toEqual([]);
      expect(component.heroBackdrop()).toBeNull();
    });
  });

  describe('Scenario: Helper Functions', () => {
    it('should generate TMDB image URL or fallback to placeholder', () => {
      expect(component.getImageUrl('/photo.jpg', 'w500')).toBe('https://image.tmdb.org/t/p/w500/photo.jpg');
      expect(component.getImageUrl(null)).toBe('assets/images/placeholder.png');
    });

    it('should extract correct title depending on whether media is movie or tv', () => {
      const movieMedia = { title: 'Dunkirk' } as any;
      const tvMedia = { name: 'Batman Begins' } as any;

      expect(component.getMediaTitle(movieMedia)).toBe('Dunkirk');
      expect(component.getMediaTitle(tvMedia)).toBe('Batman Begins');
    });
  });
});