import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '@services/api-service/api-service';
import { Movie } from '@models/movie-interface';
import { TvShow } from '@models/tvshow-interface';
import { Person } from '@models/person-interface';
import { Genre, MultiSearchResult } from '@models/tmdb-interface';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>TMDB Full ApiService Debug Output</h1>
      <p>Open your browser console (F12) to inspect payloads across Movies, TV Shows, People, and Multi-Search.</p>
    </div>
  `
})
export class MovieList implements OnInit {
  private apiService = inject(ApiService);

  // Movie state
  recommendedMovies: Movie[] = [];
  searchResults: Movie[] = [];
  filteredMovies: Movie[] = [];
  genreMovies: Movie[] = [];
  movieGenres: Genre[] = [];

  // TV Show state
  popularTvShows: TvShow[] = [];
  filteredTvShows: TvShow[] = [];
  tvGenres: Genre[] = [];

  // Person state
  popularPeople: Person[] = [];
  personSearchResults: Person[] = [];

  // Multi-Search state
  multiSearchResults: MultiSearchResult[] = [];

  ngOnInit(): void {
    // ==========================================
    // 1. GLOBAL MULTI-SEARCH CALLS
    // ==========================================
    this.apiService.searchMulti('Christopher Nolan').subscribe({
      next: (response) => {
        console.log('--- Multi-Search ("Christopher Nolan") ---', response);
        this.multiSearchResults = response.results;
        
        // Log discriminated media types
        response.results.forEach((item) => {
          if (item.media_type === 'person') {
            console.log(`[Multi] Person: ${item.name} (${item.known_for_department})`);
          } else if (item.media_type === 'movie') {
            console.log(`[Multi] Movie: ${item.title}`);
          } else if (item.media_type === 'tv') {
            console.log(`[Multi] TV Show: ${item.name}`);
          }
        });
      },
      error: (err) => console.error('Error in searchMulti:', err)
    });

    // ==========================================
    // 2. MOVIE ENDPOINTS CALLS
    // ==========================================
    // Popular Movies
    this.apiService.getMovies().subscribe({
      next: (response) => {
        console.log('--- Movie 1: Popular Movies ---', response);
        this.recommendedMovies = response.results;
      },
      error: (err) => console.error('Error fetching popular movies:', err)
    });

    // Search Movies ("Batman")
    this.apiService.getMovies({ query: 'Batman', page: 1 }).subscribe({
      next: (response) => {
        console.log('--- Movie 2: Search ("Batman") ---', response);
        this.searchResults = response.results;
      },
      error: (err) => console.error('Error searching movies:', err)
    });

    // Discover / Filtered Movies (Rating >= 7.5, Sorted by Release)
    this.apiService.getMovies({
      page: 1,
      sortBy: 'primary_release_date.desc',
      voteAverageGte: 7.5
    }).subscribe({
      next: (response) => {
        console.log('--- Movie 3: Discover / Filtered ---', response);
        this.filteredMovies = response.results;
      },
      error: (err) => console.error('Error fetching filtered movies:', err)
    });

    // Movie Genres
    this.apiService.getGenres().subscribe({
      next: (response) => {
        console.log('--- Movie 4: Movie Genres List ---', response.genres);
        this.movieGenres = response.genres;
      },
      error: (err) => console.error('Error fetching movie genres:', err)
    });

    // Movies by Genre ID (37 = Western)
    this.apiService.getMoviesByGenre(37).subscribe({
      next: (response) => {
        console.log('--- Movie 5: Western Movies (Genre 37) ---', response.results);
        this.genreMovies = response.results;
      },
      error: (err) => console.error('Error fetching genre movies:', err)
    });

    // Single Movie Details (Inception: ID 27205)
    this.apiService.getMovieDetails(27205).subscribe({
      next: (movie) => {
        console.log('--- Movie 6: Single Movie Details (Inception) ---', movie);
        console.log('Runtime:', movie.runtime, 'mins | Genres:', movie.genres.map(g => g.name).join(', '));
      },
      error: (err) => console.error('Error fetching movie details:', err)
    });

    // ==========================================
    // 3. TV SHOW ENDPOINTS CALLS
    // ==========================================
    // Popular TV Shows
    this.apiService.getTvShows().subscribe({
      next: (response) => {
        console.log('--- TV 1: Popular TV Shows ---', response);
        this.popularTvShows = response.results;
      },
      error: (err) => console.error('Error fetching popular TV shows:', err)
    });

    // TV Genres
    this.apiService.getTvGenres().subscribe({
      next: (response) => {
        console.log('--- TV 2: TV Genres List ---', response.genres);
        this.tvGenres = response.genres;
      },
      error: (err) => console.error('Error fetching TV genres:', err)
    });

    // TV Shows by Genre (10759 = Action & Adventure)
    this.apiService.getTvShowsByGenre(10759).subscribe({
      next: (response) => {
        console.log('--- TV 3: Action & Adventure TV Shows ---', response.results);
        this.filteredTvShows = response.results;
      },
      error: (err) => console.error('Error fetching TV shows by genre:', err)
    });

    // Single TV Show Details (Breaking Bad: ID 1396)
    this.apiService.getTvShowDetails(1396).subscribe({
      next: (tvDetail) => {
        console.log('--- TV 4: Single TV Details (Breaking Bad) ---', tvDetail);
        console.log('Seasons:', tvDetail.number_of_seasons, '| Genres:', tvDetail.genres.map(g => g.name).join(', '));
      },
      error: (err) => console.error('Error fetching TV details:', err)
    });

    // ==========================================
    // 4. PERSON (ACTOR/DIRECTOR) ENDPOINTS CALLS
    // ==========================================
    // Popular People
    this.apiService.getPeople().subscribe({
      next: (response) => {
        console.log('--- Person 1: Popular People ---', response);
        this.popularPeople = response.results;
      },
      error: (err) => console.error('Error fetching popular people:', err)
    });

    // Person Search ("Cillian Murphy")
    this.apiService.getPeople('Cillian Murphy').subscribe({
      next: (response) => {
        console.log('--- Person 2: Person Search ("Cillian Murphy") ---', response);
        this.personSearchResults = response.results;
      },
      error: (err) => console.error('Error searching people:', err)
    });

    // Single Person Details (Cillian Murphy: ID 2037)
    this.apiService.getPersonDetails(2037).subscribe({
      next: (person) => {
        console.log('--- Person 3: Person Details (Cillian Murphy) ---', person);
        console.log('Birthday:', person.birthday, '| Birthplace:', person.place_of_birth);
      },
      error: (err) => console.error('Error fetching person details:', err)
    });
  }
}