import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MovieDetail, type Movie } from '@models/movie-interface';

@Component({
  selector: 'app-movie-card',
  imports: [CommonModule],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.css',
})
export class MovieCard {
  movie = input.required<Movie>();
  favoriteMovie = output<void>();
  rateMovie = output<void>();
  watchLaterMovie = output<void>();

  get posterUrl(): string {
    const path = this.movie().poster_path;
    return path 
      ? `https://image.tmdb.org/t/p/w500${path}` 
      : 'https://via.placeholder.com/500x750?text=No+Poster';
  }

  onFavoriteClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.favoriteMovie.emit();
  }

  onRateClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.rateMovie.emit();
  }

  onWatchLaterClick(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    this.watchLaterMovie.emit();
  }
}
