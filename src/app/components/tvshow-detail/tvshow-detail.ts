import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '@services/api-service/api-service';
import { AuthService } from '@services/auth/auth';
import { DbService } from '@services/database/database-service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tv-show-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tvshow-detail.html'
})
export class TvShowDetails implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private apiService = inject(ApiService);
  authService = inject(AuthService);
  private dbService = inject(DbService);

  tvShow = signal<any | null>(null); 
  isLoading = signal<boolean>(true);

  // Estados visuales de botones
  isWatchlisted = signal<boolean>(false);
  isFavorited = signal<boolean>(false);

  // Estados del Modal de Estrellas
  isRatingModalOpen = signal<boolean>(false);
  selectedRating = signal<number>(0);
  hoverRating = signal<number>(0);
  showToRate = signal<any | null>(null);
  ratingOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  // Estados del Toast (Notificación)
  showSuccessMessage = signal<boolean>(false);
  successMessageText = signal<string>('');

  private userMoviesSub?: Subscription;

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchTvShow(Number(id));
        this.checkIfShowIsSaved(Number(id));
      }
    });
  }

  ngOnDestroy(): void {
    this.userMoviesSub?.unsubscribe();
  }

  fetchTvShow(id: number): void {
    this.isLoading.set(true);
    this.apiService.getTvShowDetails(id).subscribe({
      next: (data) => {
        this.tvShow.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar la serie:', err);
        this.isLoading.set(false);
      }
    });
  }

  checkIfShowIsSaved(showId: number): void {
    this.userMoviesSub = this.dbService.getUserMovies().subscribe(savedItems => {
      const savedShow = savedItems.find(m => m.id === showId);
      this.isFavorited.set(!!savedShow?.isFavorite);
      this.isWatchlisted.set(!!savedShow?.inWatchlist);
    });
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return path 
      ? `https://image.tmdb.org/t/p/${size}${path}`
      : 'assets/images/placeholder.png';
  }

  getCreator(): string {
    const creators = this.tvShow()?.created_by;
    return creators && creators.length > 0 
      ? creators.map((c: any) => c.name).join(', ') 
      : 'Desconocido';
  }

  // --- LÓGICA DE FIREBASE (ADAPTANDO NAME A TITLE) ---

  private formatTvShowForDb(show: any) {
    // Añadimos 'title' para que DbService lo acepte igual que las películas
    return { ...show, title: show.name };
  }

  async addToWatchlist(show: any) {
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    
    this.isWatchlisted.set(true); 
    this.successMessageText.set(`Added to your Watchlist!`);
    this.showSuccessMessage.set(true);
    setTimeout(() => this.showSuccessMessage.set(false), 3000);

    await this.dbService.saveMovie(this.formatTvShowForDb(show), 'watchlist');
  }

  async addToFavorites(show: any) {
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    
    this.isFavorited.set(true); 
    this.successMessageText.set(`Added to Favorites!`);
    this.showSuccessMessage.set(true);
    setTimeout(() => this.showSuccessMessage.set(false), 3000);

    await this.dbService.saveMovie(this.formatTvShowForDb(show), 'favorites');
  }

  openRatingModal(show: any) {
    if (!this.authService.currentUser()) { this.router.navigate(['/login']); return; }
    this.showToRate.set(show);
    this.hoverRating.set(0);
    this.isRatingModalOpen.set(true);
  }

  closeRatingModal() {
    this.isRatingModalOpen.set(false);
    setTimeout(() => this.showToRate.set(null), 300);
  }

  async setRating(rate: number) {
    const showData = this.showToRate();
    if (!showData) return;

    this.selectedRating.set(rate); 
    this.closeRatingModal(); 

    this.successMessageText.set(`Thanks for rating "${showData.name}" with ${rate} stars!`);
    this.showSuccessMessage.set(true);
    setTimeout(() => this.showSuccessMessage.set(false), 3000);

    try {
      await this.dbService.saveMovie(this.formatTvShowForDb(showData), 'rated', rate);
    } catch (error) {
      console.error('Error saving rating:', error);
    }
  }
}