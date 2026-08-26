import { Routes } from '@angular/router';
import { HomePage } from './components/home-page/home-page';
import { Movies } from './components/movies-list/movies-list';
import { Ranking } from './components/ranking/ranking';
import { UserProfile } from './components/user-profile/user-profile';
import { MovieCardDetails } from './components/movie-card-details/movie-card-details';

export const routes: Routes = [
    { path: '', component: HomePage},
    { path: 'Movies', component: Movies},
    { path: 'movie/:id', component: MovieCardDetails },
    { path: 'Ranking', component: Ranking},
    { path: 'Profile', component: UserProfile},
    { path: '**', redirectTo: '', pathMatch: 'prefix'}
];
