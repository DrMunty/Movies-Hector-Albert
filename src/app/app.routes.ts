import { Routes } from '@angular/router';
import { MovieList } from './feature/movie-list/movie-list'

export const routes: Routes = [
    { 
        path: '', 
        component: MovieList, 
        pathMatch: 'full' 
    },
    { 
        path: '**', 
        redirectTo: '' 
    }
];
