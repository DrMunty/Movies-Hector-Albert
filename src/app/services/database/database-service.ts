import { Injectable, inject, Injector, runInInjectionContext } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc, onSnapshot } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth'; 
import { Observable } from 'rxjs';
import type { UserMovie } from '../../models/usermovie-interface';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);
  private injector = inject(Injector); 

  async saveMovie(movie: any, listType: 'favorites' | 'watchlist', rating: number = 0): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;

    const movieRef = doc(this.firestore, `users/${user.uid}/movies/${movie.id}`);
    
    const userMovie: UserMovie = {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      listType: listType,
      userRating: rating,
      addedAt: new Date().getTime()
    };

    await setDoc(movieRef, userMovie, { merge: true });
  }

  getUserMovies(): Observable<UserMovie[]> {
    return new Observable<UserMovie[]>((observer) => {
      const user = this.auth.currentUser();
      
      if (!user) {
        observer.next([]);
        observer.complete();
        return () => {};
      }

      return runInInjectionContext(this.injector, () => {
        const moviesRef = collection(this.firestore, `users/${user.uid}/movies`);
        
        const unsubscribe = onSnapshot(
          moviesRef, 
          (snapshot) => {
            const movies = snapshot.docs.map(docSnap => docSnap.data() as UserMovie);
            observer.next(movies); 
          },
          (error) => observer.error(error)
        );

        return () => unsubscribe();
      });
    });
  }

  async removeMovie(movieId: number): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    
    const movieRef = doc(this.firestore, `users/${user.uid}/movies/${movieId}`);
    await deleteDoc(movieRef);
  }
}