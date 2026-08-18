import { Component, OnInit, inject } from '@angular/core';
import { ApiService } from '../../services/api-service/api-service';

@Component({
  selector: 'app-movie-list',
  standalone: true,
  template: `<h1>TMDB Movie Changes</h1>`
})
export class MovieList implements OnInit {
  private apiService = inject(ApiService);

  ngOnInit(): void {
    this.apiService.getMain().subscribe({
      next: (data) => console.log('TMDB Data:', data),
      error: (err) => console.error('Error fetching TMDB data:', err)
    });
  }
}