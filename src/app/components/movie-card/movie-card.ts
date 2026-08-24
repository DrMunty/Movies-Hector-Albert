import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Movie } from '@models/movie-interface';

@Component({
  selector: 'app-movie-card',
  imports: [CommonModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css',
})
export class MovieCard {
  movie = input.required<Movie>();
  get posterUrl(): string {
    const path = this.movie().poster_path;
    return path 
      ? `https://image.tmdb.org/t/p/w500${path}` 
      : 'https://via.placeholder.com/500x750?text=No+Poster';
  }
}
