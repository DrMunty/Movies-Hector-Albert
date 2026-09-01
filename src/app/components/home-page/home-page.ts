import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService} from '@services/api-service/api-service'; 
import { Genre } from '@models/tmdb-interface';
import { Movie} from '@models/movie-interface'; 
import { RouterModule } from '@angular/router';
import { Person } from '@models/person-interface';
import { TvShow } from '@models/tvshow-interface';
import { forkJoin, catchError, of} from 'rxjs';

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
  popularActors = signal<Person[]>([]);
  popularDirectors = signal<Person[]>([]);
  topRatedTv = signal<TvShow[]>([]);
  popularTv = signal<TvShow[]>([]);


  ngOnInit(): void {
    this.fetchGenres();
    this.fetchMovies();
    this.fetchTvShows();
    this.fetchActors();
    this.fetchDirectors();
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


fetchActors(): void {
    // Lista negra por si aún así queremos ocultar a alguien específico por su ID
    const blacklistedIds = [3183533]; 

    forkJoin([
      this.apiService.getPeople(undefined, 1),
      this.apiService.getPeople(undefined, 2),
      this.apiService.getPeople(undefined, 3),
      this.apiService.getPeople(undefined, 4)
    ]).subscribe({
      next: ([page1, page2, page3, page4]) => {
        const allPeople = [...page1.results, ...page2.results, ...page3.results, ...page4.results];
        
        const actorsOnly = allPeople
          .filter(person => {
            // 1. Filtros básicos
            const isActor = person.known_for_department === 'Acting';
            const hasPhoto = !!person.profile_path;
            const isNotAdult = !person.adult;
            const notInBlacklist = !blacklistedIds.includes(person.id);

            // 2. Filtro de nombre agresivo (ignorando mayúsculas por si acaso)
            const nameLower = person.name.toLowerCase();
            const isNotMayuko = !nameLower.includes('mayuko');

            // 3. EL FILTRO ESTRELLA 🌟: ¿Ha participado en películas reales?
            // Comprobamos si alguna de sus películas conocidas tiene más de 100 votos
            const hasLegitimateWork = person.known_for?.some(media => (media.vote_count || 0) > 100);

            // Solo pasa si cumple TODAS las condiciones
            return isActor && hasPhoto && isNotAdult && notInBlacklist && isNotMayuko && hasLegitimateWork;
          })
          .sort((a, b) => b.popularity - a.popularity)
          .slice(0, 10);

        this.popularActors.set(actorsOnly);
      },
      error: (err) => console.error('Error al cargar actores populares:', err)
    });
  }

fetchDirectors(): void {
  const topDirectorIds = [525, 488, 138, 227, 5655, 7467, 2710, 578, 21684, 11130];

  const directorRequests = topDirectorIds.map(id => 
    this.apiService.getPersonDetails(id).pipe(
      catchError(err => {
        console.warn(`No se pudo cargar al director ${id}:`, err.message);
        return of(null);
      })
    )
  );

  forkJoin(directorRequests).subscribe({
    next: (directors) => {
      const validDirectors = directors.filter(d => d !== null);
      this.popularDirectors.set(validDirectors);
    },
    error: (err) => console.error('Error general en directores', err)
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