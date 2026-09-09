import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { DbService } from '@services/database/database-service';
import { ApiService } from '@services/api-service/api-service';
import { AuthService } from '@services/auth/auth';
import { forkJoin, map, Subscription } from 'rxjs';
import { MovieCard } from '../movie-card/movie-card'; 
import type { UserMovie } from '@models/usermovie-interface';

@Component({
  selector: 'app-rankings',
  standalone: true,
  imports: [CommonModule, RouterModule, MovieCard],
  templateUrl: './user-ranking.html'
})
export class UserRanking implements OnInit, OnDestroy {
  private dbService = inject(DbService);
  private apiService = inject(ApiService);
  authService = inject(AuthService);
  private router = inject(Router);

  rankings = signal<any[]>([]);
  isLoading = signal<boolean>(true);

  savedMovies = signal<UserMovie[]>([]);
  private userMoviesSub?: Subscription;

  isRatingModalOpen = signal<boolean>(false);
  selectedRating = signal<number>(0);
  hoverRating = signal<number>(0);
  movieToRate = signal<any | null>(null);
  ratingOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  showSuccessMessage = signal<boolean>(false);
  successMessageText = signal<string>('');

  async ngOnInit() {
    this.isLoading.set(true);

    if (this.authService.currentUser()) {
      this.userMoviesSub = this.dbService.getUserMovies().subscribe(movies => {
        this.savedMovies.set(movies);
      });
    }

    try {
      const stats = await this.dbService.getGlobalRankings();
      
      const sortedStats = [...stats].sort((a, b) => {
        return b.favoriteCount - a.favoriteCount || b.averageRating - a.averageRating;
      });

      const top10 = sortedStats.slice(0, 10);

      if (top10.length > 0) {
        const requests = top10.map(stat => 
          this.apiService.getMovieDetails(stat.id).pipe(
            map(movieData => ({
              ...movieData, 
              rankingStats: stat 
            }))
          )
        );

        forkJoin(requests).subscribe({
          next: (fullData) => {
            this.rankings.set(fullData);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error(err);
            this.isLoading.set(false);
          }
        });
      } else {
        this.rankings.set([]);
        this.isLoading.set(false);
      }
    } catch (error) {
      console.error(error);
      this.isLoading.set(false);
    }
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

  updateLocalState(movieId: number, field: 'isFavorite' | 'inWatchlist' | 'isRated') {
    const currentMovies = this.savedMovies();
    const existing = currentMovies.find(m => m.id === movieId);
    if (existing) {
      existing[field] = true;
      this.savedMovies.set([...currentMovies]);
    } else {
      this.savedMovies.set([...currentMovies, { id: movieId, [field]: true } as any]);
    }
  }

  async addToWatchlist(movie: any) {
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    this.updateLocalState(movie.id, 'inWatchlist');
    this.successMessageText.set(`Added to your Watchlist!`);
    this.showSuccessMessage.set(true);
    setTimeout(() => this.showSuccessMessage.set(false), 3000);
    await this.dbService.saveMovie(movie, 'watchlist');
  }

  async addToFavorites(movie: any) {
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    this.updateLocalState(movie.id, 'isFavorite');
    this.successMessageText.set(`Added to Favorites!`);
    this.showSuccessMessage.set(true);
    setTimeout(() => this.showSuccessMessage.set(false), 3000);
    await this.dbService.saveMovie(movie, 'favorites');
  }

  openRatingModal(movie: any) {
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

    this.selectedRating.set(rate); 
    this.closeRatingModal();
    this.updateLocalState(movieData.id, 'isRated');

    this.successMessageText.set(`Thanks for rating "${movieData.title}" with ${rate} stars!`);
    this.showSuccessMessage.set(true);
    setTimeout(() => this.showSuccessMessage.set(false), 3000);

    try {
      await this.dbService.saveMovie(movieData, 'rated', rate);
    } catch (error) {
      console.error(error);
    }
  }
  goToMovieDetails(event: Event, movieId: number) {
    const target = event.target as HTMLElement;
  
    if (target.closest('button')) {
      return; 
    }
    this.router.navigate(['/movie', movieId]);
  }
}