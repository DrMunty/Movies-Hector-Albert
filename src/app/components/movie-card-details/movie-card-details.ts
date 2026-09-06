import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router} from '@angular/router';
import { ApiService } from '@services/api-service/api-service'; 
import { MovieDetail } from '@models/movie-interface';
import { AuthService } from '@services/auth/auth';
import { DbService } from '@services/database/database-service';

@Component({
  selector: 'app-movie-card-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card-details.html'
})
export class MovieCardDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router)
  private apiService = inject(ApiService);
  authService = inject(AuthService);
  private dbService = inject(DbService);

  movie = signal<MovieDetail | null>(null);
  isLoading = signal<boolean>(true);

  isRatingModalOpen = signal<boolean>(false);
  selectedRating = signal<number>(10);
  movieToRate = signal<MovieDetail | null>(null);
  ratingOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchMovieDetails(Number(id));
      }
    });
  }

  fetchMovieDetails(id: number): void {
    this.isLoading.set(true);
    
    this.apiService.getMovieDetails(id).subscribe({
      next: (response) => {
        this.movie.set(response); 
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('An error ocurred while loading movie details', err);
        this.isLoading.set(false);
      }
    });
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
  }

  getDirector(): any {
    return this.movie()?.credits?.crew.find((member: any) => member.job === 'Director');
  }

  async addToWatchlist(movie: MovieDetail) {
    if (!this.authService.currentUser()) {
      this.router.navigate(['/login']);
      return;
    }
    await this.dbService.saveMovie(movie, 'watchlist');
    alert(`${movie.title} added to your Watchlist!`);
  }

  openRatingModal(movie: MovieDetail) {
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

  async setRating(rate: number) {
    this.selectedRating.set(rate);
    const movieData = this.movieToRate();

    if (movieData) {
      await this.dbService.saveMovie(movieData, 'rated' as any, rate);
      alert(`Awesome! You rated ${movieData.title} with a ${rate}/10.`);
    }
  
    this.closeRatingModal();
  }
}