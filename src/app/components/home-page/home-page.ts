import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService} from '@services/api-service/api-service'; 
import { Genre } from '@models/tmdb-interface';
import { Movie} from '@models/movie-interface'; 
import { RouterModule } from '@angular/router';
import { Person } from '@models/person-interface';
import { TvShow } from '@models/tvshow-interface';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home-page.html',
  styleUrls: ['./home-page.css']
})
export class HomePage implements OnInit {
  private apiService = inject(ApiService);

  currentSlideIndex = signal<number>(0);

  featuredMovies = signal<Movie[]>([]);
  topRatedMovies = signal<Movie[]>([]);
  recentMovies = signal<Movie[]>([]);
  genres = signal<Genre[]>([]); 
  popularActors = signal<Person[]>(Array(10).fill({}));
  popularDirectors = signal<Person[]>(Array(10).fill({}));
  topRatedTv = signal<TvShow[]>(Array(10).fill({}));
  popularTv = signal<TvShow[]>(Array(10).fill({}));

  ngOnInit(): void {
    this.fetchGenres();
    this.fetchMovies();
    this.fetchTvShows();

  }

  fetchGenres(): void {
    this.apiService.getGenres().subscribe({
      next: (res) => this.genres.set(res.genres || [])
    });
  }

  fetchMovies(): void {

    this.apiService.getMovies().subscribe({
      next: (res) => this.featuredMovies.set(res.results)
    });

    this.apiService.getMovies({ 
      sortBy: 'vote_average.desc', 
      voteAverageGte: 8,
      voteCountGte: 3000 
    }).subscribe({
      next: (res) => this.topRatedMovies.set(res.results)
    });

    this.apiService.getMovies({ 
      sortBy: 'popularity.desc', 
      primaryReleaseYear: 2026 
    }).subscribe({
      next: (res) => this.recentMovies.set(res.results)
    });
  }

   fetchTvShows(): void {
    this.apiService.getTvShows().subscribe({
      next: (res) => this.topRatedTv.set(res.results)
    });

    this.apiService.getTvShows({
      sortBy: 'vote_average.desc', 
      voteAverageGte: 8,
      voteCountGte: 3000
    }).subscribe({
      next: (res) => this.topRatedTv.set(res.results)
    });

     this.apiService.getTvShows({ 
      sortBy: 'popularity.desc', 
      firstAirDateYear: 2026
    }).subscribe({
      next: (res) => this.popularTv.set(res.results)
    });
   }



  getImageUrl(path: string | null, size: string = 'w500'): string {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://via.placeholder.com/500x750?27272a/ffffff?text=No+Image';
  }

  getGenreNames(genreIds: number[]): string {
    if (!genreIds || !this.genres().length) return 'Película';
    return genreIds
      .map(id => this.genres().find(g => g.id === id)?.name)
      .filter(name => name)
      .slice(0, 2)
      .join(', ');
  }

  nextSlide(): void {
    if (this.featuredMovies().length === 0) return;
    this.currentSlideIndex.update(i => (i + 1) % this.featuredMovies().length);
  }

  prevSlide(): void {
    if (this.featuredMovies().length === 0) return;
    this.currentSlideIndex.update(i => (i - 1 + this.featuredMovies().length) % this.featuredMovies().length);
  }
}