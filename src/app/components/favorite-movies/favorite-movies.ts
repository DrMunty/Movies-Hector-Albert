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

  favoriteMovies = computed(() => {
    return this.allUserMovies()
      .filter((m: UserMovie) => m.listType === 'favorites')
      .sort((a, b) => (b.userRating || 0) - (a.userRating || 0));
  });

  watchlistMovies = computed(() => {
    return this.allUserMovies()
      .filter((m: UserMovie) => m.listType === 'watchlist')
      .sort((a, b) => b.addedAt - a.addedAt);
  });

  ngOnInit(): void {
    this.dbService.getUserMovies().subscribe((movies: UserMovie[]) => {
      this.allUserMovies.set(movies);
    });
  }

  getImageUrl(path: string | null): string {
    return path ? `https://image.tmdb.org/t/p/w500${path}` : 'https://via.placeholder.com/500x750?27272a/ffffff?text=No+Image';
  }

  async removeMovie(id: number): Promise<void> {
    await this.dbService.removeMovie(id);
  }
}

