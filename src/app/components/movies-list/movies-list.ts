import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '@services/api-service/api-service'; 
import { Movie, MovieQueryParams } from '@models/movie-interface';
import { Genre } from '@models/tmdb-interface';
import { MovieCard } from '../movie-card/movie-card'; 
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@services/auth/auth';
import { DbService } from '@services/database/database-service';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MovieCard, RouterModule],
  templateUrl: './movies-list.html'
})
export class Movies implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);
  private router = inject(Router);
  authService = inject(AuthService);
  private dbService = inject(DbService);

  moviesList = signal<Movie[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  isLoading = signal<boolean>(true);
  genres = signal<Genre[]>([]);

  isRatingModalOpen = signal<boolean>(false);
  selectedRating = signal<number>(10);
  movieToRate = signal<Movie | null>(null);
  ratingOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  filterForm: FormGroup = this.fb.group({
    query: [''],
    sort_by: ['popularity.desc'],
    with_genres: [''],
    vote_average_gte: ['']
  });

  ngOnInit(): void {
    this.fetchGenres();
    this.fetchMovies();

    this.filterForm.get('query')?.valueChanges.subscribe(text => {
      const controlsToToggle = ['sort_by', 'with_genres', 'vote_average_gte'];
      
      controlsToToggle.forEach(controlName => {
        const control = this.filterForm.get(controlName);
        if (text && text.trim() !== '') {
          control?.disable({ emitEvent: false });
        } else {
          control?.enable({ emitEvent: false });
        }
      });
    });

    this.filterForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(1);
      this.fetchMovies();
    });
  }

  fetchGenres(): void {
    this.apiService.getGenres().subscribe({
      next: (response) => {
        this.genres.set(response.genres);
      },
      error: (err) => {
        console.error('Could not load genres:', err);
      }
    });
  }

  fetchMovies(): void {
    this.isLoading.set(true);
    
    const currentFilters = this.filterForm.getRawValue();

    const queryParams: MovieQueryParams = {
      page: this.currentPage(),
      query: currentFilters.query,
      sortBy: currentFilters.sort_by,
      withGenres: currentFilters.with_genres ? Number(currentFilters.with_genres) : undefined,
      voteAverageGte: currentFilters.vote_average_gte ? Number(currentFilters.vote_average_gte) : undefined
    };

    this.apiService.getMovies(queryParams).subscribe({
      next: (response) => {
        this.moviesList.set(response.results);
        this.totalPages.set(response.total_pages);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Could not load movies:', err);
        this.isLoading.set(false);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.fetchMovies();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.fetchMovies();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  async addToWatchlist(movie: Movie) {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
    await this.dbService.saveMovie(movie, 'watchlist');
    alert(`${movie.title} added to your Watchlist!`);
  }

  openRatingModal(movie: Movie) {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
    this.movieToRate.set(movie);
    this.selectedRating.set(10); 
    this.isRatingModalOpen.set(true);
  }

  closeRatingModal() {
    this.isRatingModalOpen.set(false);
    setTimeout(() => this.movieToRate.set(null), 300);
  }

  setRating(rate: number) {
    this.selectedRating.set(rate);
  }

  async confirmAddToFavorites() {
    const movieData = this.movieToRate();
    const rating = this.selectedRating();

    if (movieData) {
      await this.dbService.saveMovie(movieData, 'favorites', rating);
      alert(`${movieData.title} added to Favorites with ${rating}/10!`);
    }
    this.closeRatingModal();
  }
}