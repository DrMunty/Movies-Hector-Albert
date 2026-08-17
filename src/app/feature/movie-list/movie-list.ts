import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '@services/api-service/api-service';
import { Movie, Genre } from '@models/movie-interface'; // Adjust import paths to match your project

@Component({
  selector: 'app-movie-list',
  standalone: true,
  template: `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>TMDB API Debug Output</h1>
      <p>Check your browser console (F12) to inspect the API payloads.</p>
    </div>
  `
})
export class MovieList implements OnInit {
  private apiService = inject(ApiService);

  recommendedMovies: Movie[] = [];
  searchResults: Movie[] = [];
  filteredMovies: Movie[] = [];
  genreMovies: Movie[] = [];
  genres: Genre[] = [];

  ngOnInit(): void {
    // 1. Default Call: /movie/popular (Page 1)
    this.apiService.getMovies().subscribe({
      next: (response) => {
        console.log('--- 1. Default Recommendations Response ---', response);
        console.log('Total Pages:', response.total_pages);
        console.log('Total Results:', response.total_results);
        console.log('First Movie Sample:', response.results[0]);
        this.recommendedMovies = response.results;
      },
      error: (err) => console.error('Error fetching recommendations:', err)
    });

    // 2. Search Call: /search/movie (e.g., query "Batman")
    this.apiService.getMovies({ query: 'Batman', page: 1 }).subscribe({
      next: (response) => {
        console.log('--- 2. Search Query ("Batman") Response ---', response);
        console.log('Search Results Array:', response.results);
        this.searchResults = response.results;
      },
      error: (err) => console.error('Error fetching search results:', err)
    });

    // 3. Filtered & Sorted Call: /discover/movie (Page 2, Rating >= 7.5, Sorted by Release Date)
    this.apiService.getMovies({
      page: 2,
      sortBy: 'primary_release_date.desc',
      voteAverageGte: 7.5
    }).subscribe({
      next: (response) => {
        console.log('--- 3. Filtered / Discover Response ---', response);
        console.log('Filtered Movies Array:', response.results);
        this.filteredMovies = response.results;
      },
      error: (err) => console.error('Error fetching filtered movies:', err)
    });

    // 4. Genres Call: /genre/movie/list
    this.apiService.getGenres().subscribe({
      next: (response) => {
        console.log('--- 4. Movie Genres List ---', response.genres);
        this.genres = response.genres;
      },
      error: (err) => console.error('Error fetching genres:', err)
    });
    // Fetching Action Movies (ID: 28) page 1 directly from ApiService
    this.apiService.getMoviesByGenre(37).subscribe({
      next: (response) => {
        console.log('--- Action Movies ---', response.results);
        this.genreMovies = response.results;
      },
      error: (err) => console.error('Error fetching action movies:', err)
    });

    // 5. Single Movie Details Call: /movie/{id} (Inception: ID 27205)
    this.apiService.getMovieDetails(27205).subscribe({
      next: (movie) => {
        console.log('--- 5. Single Movie Details (Inception) ---', movie);
        console.log('Runtime:', movie.runtime, 'mins');
        console.log('Genres:', movie.genres.map(g => g.name).join(', '));
      },
      error: (err) => console.error('Error fetching movie details:', err)
    });
  }
}