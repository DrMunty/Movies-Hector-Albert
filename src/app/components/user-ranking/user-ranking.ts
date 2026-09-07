import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DbService } from '@services/database/database-service';
import { ApiService } from '@services/api-service/api-service';
import { forkJoin, map } from 'rxjs';
import { MovieCard } from '@components/movie-card/movie-card';

@Component({
  imports: [CommonModule, RouterModule, MovieCard],
  selector: 'app-user-ranking',
  styleUrl: './user-ranking.css',
  templateUrl: './user-ranking.html',
})
export class UserRanking implements OnInit {
  private dbService = inject(DbService);
  private apiService = inject(ApiService);

  rankings = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  sortBy = signal<'favorites' | 'rating'>('favorites');

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      const firestoreData = await this.dbService.getGlobalRankings();
      const top10 = firestoreData
        .sort((a, b) => b.favoriteCount - a.favoriteCount || b.averageRating - a.averageRating)
        .slice(0, 10);
      if (top10.length > 0) {
        const requests = top10.map((stat) =>
          this.apiService.getMovieDetails(stat.id).pipe(
            map((movieData) => ({
              ...movieData,
              rankingStats: stat,
            })),
          ),
        );

        forkJoin(requests).subscribe({
          next: (fullData) => {
            this.rankings.set(fullData);
            this.isLoading.set(false);
          },
          error: (err) => {
            console.error('Error cargando detalles de TMDB:', err);
            this.isLoading.set(false);
          },
        });
      } else {
        this.isLoading.set(false);
      }
    } catch (error) {
      console.error('Error cargando rankings:', error);
      this.isLoading.set(false);
    }
  }

  sortData(criteria: 'favorites' | 'rating') {
    this.sortBy.set(criteria);
    const sorted = [...this.rankings()].sort((a, b) => {
      if (criteria === 'favorites') {
        return b.favoriteCount - a.favoriteCount || b.averageRating - a.averageRating;
      } else {
        return b.averageRating - a.averageRating || b.favoriteCount - a.favoriteCount;
      }
    });
    this.rankings.set(sorted);
  }
}
