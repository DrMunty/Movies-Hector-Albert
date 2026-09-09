import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '@services/api-service/api-service'; 
import { MovieDetail } from '@models/movie-interface';
import { AuthService } from '@services/auth/auth';
import { DbService } from '@services/database/database-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-movie-card-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card-details.html'
})
export class MovieCardDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  authService = inject(AuthService);
  private dbService = inject(DbService);

  movie = signal<MovieDetail | null>(null);
  isLoading = signal<boolean>(true);

  isWatchlisted = signal<boolean>(false);
  isFavorited = signal<boolean>(false);
  isRated = signal<boolean>(false);

  isRatingModalOpen = signal<boolean>(false);
  selectedRating = signal<number>(0);
  hoverRating = signal<number>(0);
  movieToRate = signal<MovieDetail | null>(null);
  ratingOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  showSuccessMessage = signal<boolean>(false);
  successMessageText = signal<string>('');

  private userMoviesSub?: Subscription; 

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchMovieDetails(Number(id));
        this.checkIfMovieIsSaved(Number(id)); 
      }
    });
  }

  ngOnDestroy(): void {
    this.userMoviesSub?.unsubscribe();
  }

  fetchMovieDetails(id: number): void {
    this.isLoading.set(true);
    this.apiService.getMovieDetails(id).subscribe({
      next: (response) => {
        this.movie.set(response); 
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar la película:', err);
        this.isLoading.set(false);
      }
    });
  }

  checkIfMovieIsSaved(movieId: number): void {
    this.userMoviesSub = this.dbService.getUserMovies().subscribe(movies => {
      const savedMovie = movies.find(m => m.id === movieId);
      this.isFavorited.set(!!savedMovie?.isFavorite);
      this.isWatchlisted.set(!!savedMovie?.inWatchlist);
      this.isRated.set(!!savedMovie?.isRated);
    });
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
  }

  getDirector(): any {
    return this.movie()?.credits?.crew.find((member: any) => member.job === 'Director');
  }

  private showToast(message: string) {
    this.successMessageText.set(message);
    this.showSuccessMessage.set(true);
    setTimeout(() => this.showSuccessMessage.set(false), 3000);
  }

  async addToWatchlist(movie: MovieDetail) {
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    
    const currentState = this.isWatchlisted();
    this.isWatchlisted.set(!currentState);
  
    if (currentState) {
      this.showToast('Removed from Watchlist');
      await this.dbService.removeMovie(movie.id, 'inWatchlist');
    } else {
      this.showToast('Added to your Watchlist!');
      await this.dbService.saveMovie(movie, 'watchlist');
    }
  }

  async addToFavorites(movie: MovieDetail) {
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    
    const currentState = this.isFavorited();
    this.isFavorited.set(!currentState);

    if (currentState) {
      this.showToast('Removed from Favorites');
      await this.dbService.removeMovie(movie.id, 'isFavorite');
    } else {
      this.showToast('Added to Favorites!');
      await this.dbService.saveMovie(movie, 'favorites');
    }
  }

  openRatingModal(movie: MovieDetail) {
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    this.movieToRate.set(movie);
    this.isRatingModalOpen.set(true);
  }

  closeRatingModal() {
    this.isRatingModalOpen.set(false);
    setTimeout(() => this.movieToRate.set(null), 300);
  }

  async setRating(rate: number) {
    const movieData = this.movieToRate();
    if (!movieData) return;

    const wasAlreadyRated = this.isRated();
    this.selectedRating.set(rate); 
    this.closeRatingModal(); 
    this.isRated.set(true);

    if (wasAlreadyRated) {
      this.showToast(`Rating updated to ${rate} stars!`);
    } else {
      this.showToast(`Thanks for rating "${movieData.title}" with ${rate} stars!`);
    }

    try {
      await this.dbService.saveMovie(movieData, 'rated', rate);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  }
}