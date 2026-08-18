import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { ApiService } from '../../services/api-service/api-service'; 
import { Movie, Genre } from '../../models/movie-interface'; // Añadimos Genre aquí
import { MovieCard } from '../movie-card/movie-card'; 

@Component({
  selector: 'app-movies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MovieCard],
  templateUrl: './movies.html'
})

export class Movies implements OnInit {
  private apiService = inject(ApiService);
  private fb = inject(FormBuilder);

  moviesList = signal<Movie[]>([]);
  currentPage = signal<number>(1);
  totalPages = signal<number>(1);
  isLoading = signal<boolean>(true);
  genres = signal<Genre[]>([]);

  filterForm: FormGroup = this.fb.group({
    query: [''],
    sort_by: ['popularity.desc'],
    with_genres: [''],
    vote_average_gte: ['']
  });

  ngOnInit(): void {
  
    this.fetchGenres();
    
    this.fetchMovies();

    this.filterForm.get('query')?.valueChanges.subscribe(text => {
      if (text && text.trim() !== '') {
        this.filterForm.get('sort_by')?.disable({ emitEvent: false });
        this.filterForm.get('with_genres')?.disable({ emitEvent: false });
        this.filterForm.get('vote_average_gte')?.disable({ emitEvent: false });
      } else {
        this.filterForm.get('sort_by')?.enable({ emitEvent: false });
        this.filterForm.get('with_genres')?.enable({ emitEvent: false });
        this.filterForm.get('vote_average_gte')?.enable({ emitEvent: false });
      }
    });

    this.filterForm.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged()
    ).subscribe(() => {
      this.currentPage.set(1);
      this.fetchMovies();
    });
  }


  fetchGenres(): void {
    this.apiService.getGenres().subscribe({
      next: (response) => {
        this.genres.set(response.genres || []);
      },
      error: (err) => console.error('Could not load movie genres:', err)
    });
  }

  fetchMovies(): void {
    this.isLoading.set(true);
    const currentFilters = this.filterForm.value;

    this.apiService.getFilteredMovies(this.currentPage(), currentFilters).subscribe({
      next: (response) => {
        this.moviesList.set(response.results || []);
        this.totalPages.set(Math.min(response.total_pages, 500)); 
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Could not load movie list:', err);
        this.isLoading.set(false);
      }
    });
  }

  nextPage(): void {
    if (this.currentPage() < this.totalPages()) {
      this.currentPage.update(p => p + 1);
      this.fetchMovies();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevPage(): void {
    if (this.currentPage() > 1) {
      this.currentPage.update(p => p - 1);
      this.fetchMovies();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
}