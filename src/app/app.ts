import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { MovieList } from './feature/movie-list/movie-list';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Navbar, MovieList, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.css',
})

export class App {}