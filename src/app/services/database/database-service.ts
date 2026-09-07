import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc, onSnapshot, collectionGroup, getDocs } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth';
import { Observable, switchMap, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import type { UserMovie } from '../../models/usermovie-interface';

@Injectable({
  providedIn: 'root',
})
export class DbService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private injector = inject(Injector);

  async saveMovie(
    movie: any,
    action: 'favorites' | 'watchlist' | 'rated',
    rating: number = 0,
  ): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;

    const movieRef = doc(this.firestore, `users/${user.uid}/movies/${movie.id}`);

    const updateData: any = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      addedAt: new Date().getTime(),
    };

    if (action === 'favorites') updateData.isFavorite = true;
    if (action === 'watchlist') updateData.inWatchlist = true;
    if (action === 'rated') {
      updateData.isRated = true;
      updateData.userRating = rating;
    }

    await setDoc(movieRef, updateData, { merge: true });
  }

  getUserMovies(): Observable<UserMovie[]> {
    return toObservable(this.auth.currentUser, { injector: this.injector }).pipe(
      switchMap((user) => {
        if (!user) {
          return of([]);
        }

        return new Observable<UserMovie[]>((observer) => {
          return runInInjectionContext(this.injector, () => {
            const moviesRef = collection(this.firestore, `users/${user.uid}/movies`);
            const unsubscribe = onSnapshot(
              moviesRef,
              (snapshot) => {
                const movies = snapshot.docs.map((docSnap) => docSnap.data() as UserMovie);
                observer.next(movies);
              },
              (error) => observer.error(error),
            );
            return () => unsubscribe();
          });
        });
      }),
    );
  }

  async removeMovie(movieId: number): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;

    const movieRef = doc(this.firestore, `users/${user.uid}/movies/${movieId}`);
    await deleteDoc(movieRef);
  }

  async getGlobalRankings() {
    const moviesRef = collectionGroup(this.firestore, 'movies');
    const snapshot = await getDocs(moviesRef);

    const stats = new Map<number, any>();

    snapshot.forEach(doc => {
      const data = doc.data();
      
      if (!stats.has(data['id'])) {
        stats.set(data['id'], {
          id: data['id'],
          title: data['title'],
          favoriteCount: 0,
          ratingSum: 0,
          ratingCount: 0
        });
      }

      const movieStat = stats.get(data['id']);
      if (data['isFavorite']) movieStat.favoriteCount++;
      if (data['isRated'] && data['userRating']) {
        movieStat.ratingSum += data['userRating'];
        movieStat.ratingCount++;
      }
    });

    return Array.from(stats.values())
      .map(movie => ({
        ...movie,
        averageRating: movie.ratingCount > 0 ? (movie.ratingSum / movie.ratingCount) : 0
      }))
      .filter(movie => movie.favoriteCount > 0 || movie.ratingCount > 0);
  }
}
