import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { ApiService } from '@services/api-service/api-service'; 
import { Movie, MovieQueryParams } from '@models/movie-interface';
import { Genre } from '@models/tmdb-interface';
import { MovieCard } from '../movie-card/movie-card'; 
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '@services/auth/auth';
import { DbService } from '@services/database/database-service';
import type { UserMovie } from '@models/usermovie-interface';

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MovieCard, RouterModule],
  templateUrl: './movies-list.html'
})
export class Movies implements OnInit, OnDestroy {
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

  savedMovies = signal<UserMovie[]>([]);
  private userMoviesSub?: Subscription;

  isRatingModalOpen = signal<boolean>(false);
  selectedRating = signal<number>(0);
  hoverRating = signal<number>(0);
  movieToRate = signal<Movie | null>(null);
  ratingOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  showSuccessMessage = signal<boolean>(false);
  successMessageText = signal<string>('');

  filterForm: FormGroup = this.fb.group({
    query: [''],
    sort_by: ['popularity.desc'],
    with_genres: [''],
    vote_average_gte: ['']
  });

  ngOnInit(): void {
    this.fetchGenres();
    this.fetchMovies();
    
    this.userMoviesSub = this.dbService.getUserMovies().subscribe({
      next: (movies) => {
        this.savedMovies.set(movies);
      },
      error: (err) => console.error('An error ocurred when loading user movies', err)
      });

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

  ngOnDestroy(): void {
    this.userMoviesSub?.unsubscribe();
  }

  isMovieFavorite(id: number): boolean {
    return !!this.savedMovies().find(m => m.id === id && m.isFavorite);
  }

  isMovieWatchlisted(id: number): boolean {
    return !!this.savedMovies().find(m => m.id === id && m.inWatchlist);
  }

  isMovieRated(id: number): boolean {
    return !!this.savedMovies().find(m => m.id === id && m.isRated);
  }

  updateLocalState(movieId: number, field: 'isFavorite' | 'inWatchlist' | 'isRated', value: boolean) {
    const currentMovies = this.savedMovies();
    const existing = currentMovies.find(m => m.id === movieId);
    if (existing) {
      existing[field] = value;
      this.savedMovies.set([...currentMovies]);
    } else if (value) {
      this.savedMovies.set([...currentMovies, { id: movieId, [field]:value } as any]);
    }
  }

  private showToast(message: string) {
    this.successMessageText.set(message);
    this.showSuccessMessage.set(true);
    setTimeout(() => this.showSuccessMessage.set(false), 3000);
  }

  fetchGenres(): void {
    this.apiService.getGenres().subscribe({
      next: (response) => this.genres.set(response.genres),
      error: (err) => console.error('Could not load genres:', err)
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
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    
    const isWatchlisted = this.isMovieWatchlisted(movie.id);
    this.updateLocalState(movie.id, 'inWatchlist', !isWatchlisted);

    if (isWatchlisted) {
      this.showToast('Removed from Watchlist');
      await this.dbService.removeMovie(movie.id, 'inWatchlist');
    } else {
      this.showToast('Added to your Watchlist!');
      await this.dbService.saveMovie(movie, 'watchlist');
    }
  }

  async addToFavorites(movie: Movie) {
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    
    const isFav = this.isMovieFavorite(movie.id);
    this.updateLocalState(movie.id, 'isFavorite', !isFav);

    if (isFav) {
      this.showToast('Removed from Favorites');
      await this.dbService.removeMovie(movie.id, 'isFavorite');
    } else {
      this.showToast('Added to Favorites!');
      await this.dbService.saveMovie(movie, 'favorites');
    }
  }

  openRatingModal(movie: Movie) {
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    this.movieToRate.set(movie);
    this.hoverRating.set(0);
    this.isRatingModalOpen.set(true);
  }

  closeRatingModal() {
    this.isRatingModalOpen.set(false);
    setTimeout(() => this.movieToRate.set(null), 300);
  }

  async setRating(rate: number) {
    const movieData = this.movieToRate();
    if (!movieData) return;

    const wasAlreadyRated = this.isMovieRated(movieData.id);
    
    this.selectedRating.set(rate); 
    this.closeRatingModal();
    this.updateLocalState(movieData.id, 'isRated', true);

    if (wasAlreadyRated) {
      this.showToast(`Rating updated to ${rate} stars!`);
    } else {
      this.showToast(`Thanks for rating "${movieData.title}" with ${rate} stars!`);
    }

    try {
      await this.dbService.saveMovie(movieData, 'rated', rate);
    } catch (error) {
      console.error(error);
    }
  }
}