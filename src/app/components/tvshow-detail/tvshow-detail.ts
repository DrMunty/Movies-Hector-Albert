import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '@services/api-service/api-service';

@Component({
  selector: 'app-tv-show-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './tvshow-detail.html'
})
export class TvShowDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  tvShow = signal<any | null>(null); // Sustituye 'any' por tu interfaz TvShowDetail si la tienes
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.fetchTvShow(Number(id));
      }
    });
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
}