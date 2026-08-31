import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '@services/api-service/api-service'; 
import { MovieDetail } from '@models/movie-interface';

@Component({
  selector: 'app-movie-card-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card-details.html'
})
export class MovieCardDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  movie = signal<MovieDetail | null>(null);
  isLoading = signal<boolean>(true);

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
        console.error('Error al cargar los detalles de la película:', err);
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
}