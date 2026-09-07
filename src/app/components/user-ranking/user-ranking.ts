import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { DbService } from '@services/database/database-service';

@Component({
  imports: [CommonModule, RouterModule],
  selector: 'app-user-ranking',
  styleUrl: './user-ranking.css',
  templateUrl: './user-ranking.html',
})
export class UserRanking implements OnInit{
  private dbService = inject(DbService);

  rankings = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  sortBy = signal<'favorites' | 'rating'>('favorites');

  async ngOnInit() {
    this.isLoading.set(true);
    try {
      const data = await this.dbService.getGlobalRankings();
      this.rankings.set(data);
      this.sortData('favorites');
    } catch (error) {
      console.error('Error cargando rankings:', error);
    } finally {
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

