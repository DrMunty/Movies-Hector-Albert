import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DbService } from '@services/database/database-service';
import { AuthService } from '@services/auth/auth';
import type { UserMovie } from '@models/usermovie-interface';

@Component({
  imports: [CommonModule, RouterLink],
  standalone: true,
  selector: 'app-favorite-movies',
  styleUrl: './favorite-movies.css',
  templateUrl: './favorite-movies.html',
})
export class FavoriteMovies implements OnInit {
  private dbService: DbService = inject(DbService);
  authService: AuthService = inject(AuthService);
  currentUser = this.authService.currentUser;

  allUserMovies = signal<UserMovie[]>([]);
  isLoading = signal<boolean>(true); 

  // 1. Filtrar Favoritas
  favoriteMovies = computed(() => {
    return this.allUserMovies()
      .filter((m: UserMovie) => m.isFavorite)
      .sort((a, b) => b.addedAt - a.addedAt); 
  });

  watchlistMovies = computed(() => {
    return this.allUserMovies()
      .filter((m: UserMovie) => m.inWatchlist)
      .sort((a, b) => b.addedAt - a.addedAt);
  });

  ratedMovies = computed(() => {
    return this.allUserMovies()
      .filter((m: UserMovie) => m.isRated)
      .sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
  });

  ngOnInit(): void {
    this.isLoading.set(true);
    this.dbService.getUserMovies().subscribe({
      next: (movies: UserMovie[]) => {
        this.allUserMovies.set(movies);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar las películas de Firebase:', err);
        this.isLoading.set(false);
      }
    });
  }

  getImageUrl(path: string | null): string {
    return path 
      ? `https://image.tmdb.org/t/p/w500${path}` 
      : 'https://via.placeholder.com/500x750?27272a/ffffff?text=No+Image';
  }

  async removeMovie(id: number): Promise<void> {
    await this.dbService.removeMovie(id);
  }
}