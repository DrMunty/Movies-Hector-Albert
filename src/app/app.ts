import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MovieCard } from './components/movie-card/movie-card';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, MovieCard],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
mockMovie = {
    id: 27205,
    title: 'Inception',
    overview: 'Cobb, un ejecutivo corporativo que roba valiosos secretos de las mentes de sus objetivos mientras sueñan, es buscado por la ley. Ahora se le ofrece la oportunidad de redimirse realizando lo imposible: la incepción.',
    poster_path: '/tXnxeQ1D9uEaK2sP6r9gJ3v2NIn.jpg',
    release_date: '2010-07-15',
    vote_average: 8.36,
    vote_count: 35000,
    adult: false,
    backdrop_path: '/8Z8dptEQ9HKgZxea3oXAWp8KWa0.jpg',
    genre_ids: [28, 878, 12],
    original_language: 'en',
    original_title: 'Inception',
    popularity: 150.5,
    softcore: false,
    video: false
  };
}
