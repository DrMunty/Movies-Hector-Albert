import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-movie-card-details',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './movie-card-details.html'
})
export class MovieCardDetails implements OnInit {
  private route = inject(ActivatedRoute);

  movie = signal<any>(null);
  isLoading = signal<boolean>(true);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    setTimeout(() => {
      this.loadMockData();
      this.isLoading.set(false);
    }, 500);
  }

  loadMockData(): void {
    this.movie.set({
      id: 27205,
      title: 'Origen (Inception)',
      original_title: 'Inception',
      release_date: '2010-07-15',
      runtime: 148,
      vote_average: 8.8,
      backdrop_path: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
      poster_path: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
      overview: 'Dom Cobb es un ladrón experto, el mejor en el peligroso arte de la extracción: robar valiosos secretos de lo más profundo del subconsciente durante el estado de sueño. Su rara habilidad lo ha convertido en un codiciado jugador en el traicionero mundo del espionaje corporativo...',
      genres: [
        { id: 28, name: 'Acción' },
        { id: 878, name: 'Ciencia Ficción' },
        { id: 12, name: 'Aventura' }
      ],
      credits: {
        cast: [
          { name: 'Leonardo DiCaprio', character: 'Dom Cobb', profile_path: '/wo2hJpn04vbtmh0B9utCFdsQhxM.jpg' },
          { name: 'Joseph Gordon-Levitt', character: 'Arthur', profile_path: '/dhv9f3GGcOsyBPTcbO3qFEaXzpc.jpg' },
          { name: 'Elliot Page', character: 'Ariadne', profile_path: '/tp5GflVfK3N9LpUq58434KqZ9xM.jpg' },
          { name: 'Tom Hardy', character: 'Eames', profile_path: '/yVGF9FvHxXCVH3ITNwRTIEG9hB.jpg' },
          { name: 'Cillian Murphy', character: 'Robert Fischer', profile_path: '/8qBylBsQf4llkGrRV3W7vqZ7vBv.jpg' }
        ],
        crew: [
          { name: 'Christopher Nolan', job: 'Director' }
        ]
      }
    });
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return path ? `https://image.tmdb.org/t/p/${size}${path}` : 'https://via.placeholder.com/500x750?text=No+Image';
  }

  getDirector(): string {
    const director = this.movie()?.credits?.crew.find((member: any) => member.job === 'Director');
    return director ? director.name : 'Desconocido';
  }
}