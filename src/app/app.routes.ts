import { Routes } from '@angular/router';
import { HomePage } from '@components/home-page/home-page';
import { Movies } from '@components/movies-list/movies-list';
import { MovieCardDetails } from '@components/movie-card-details/movie-card-details';
import { PersonDetails } from '@components/person-detail/person-detail';
import { TvShowDetails } from '@components/tvshow-detail/tvshow-detail';
import { Login } from '@components/login/login';
import { FavoriteMovies } from '@components/favorite-movies/favorite-movies';
import { UserRanking } from '@components/user-ranking/user-ranking';
import { UserProfile } from '@components/user-profile/user-profile';

export const routes: Routes = [
    { path: '', component: HomePage},
    { path: 'Movies', component: Movies},
    { path: 'movie/:id', component: MovieCardDetails },
    { path: 'person/:id', component: PersonDetails},
    { path: 'tv/:id', component: TvShowDetails},
    { path: 'login', component: Login},
    { path: 'user-movies', component: FavoriteMovies},
    { path: 'user-ranking', component: UserRanking},
    { path: 'profile', component: UserProfile},
    { path: '**', redirectTo: '', pathMatch: 'prefix'}
];
