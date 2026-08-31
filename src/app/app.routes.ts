import { Routes } from '@angular/router';
import { HomePage } from './components/home-page/home-page';
import { Movies } from './components/movies-list/movies-list';
// import { Ranking } from './components/ranking/ranking';
// import { UserProfile } from './components/user-profile/user-profile';
import { MovieCardDetails } from './components/movie-card-details/movie-card-details';
import { PersonDetails } from './components/person-detail/person-detail';
import { TvshowDetails } from './components/tvshow-detail/tvshow-detail';

export const routes: Routes = [
    { path: '', component: HomePage},
    { path: 'Movies', component: Movies},
    { path: 'movie/:id', component: MovieCardDetails },
    { path: 'person/:id', component: PersonDetails},
    { path: 'tv/:id', component: TvshowDetails},
    // { path: 'Ranking', component: Ranking},
    // { path: 'Profile', component: UserProfile},
    { path: '**', redirectTo: '', pathMatch: 'prefix'}
];
