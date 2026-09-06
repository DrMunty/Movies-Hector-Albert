import { Injectable, inject } from '@angular/core';
import { Firestore, collection, doc, setDoc, deleteDoc, query, collectionData } from '@angular/fire/firestore';
import { AuthService } from '../auth/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DbService {
  private firestore = inject(Firestore);
  private auth = inject(AuthService);

  async saveMovie(movie: any, listType: 'favorites' | 'watchlist', rating: number = 0): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;

    const movieRef = doc(this.firestore, `users/${user.uid}/movies/${movie.id}`);
    
    await setDoc(movieRef, {
      id: movie.id,
      title: movie.title,
      poster_path: movie.poster_path,
      listType: listType,
      userRating: rating,
      addedAt: new Date().getTime()
    }, { merge: true });
  }

  getUserMovies(): Observable<any[]> {
    const user = this.auth.currentUser();
    if (!user) return new Observable();

    const moviesRef = collection(this.firestore, `users/${user.uid}/movies`);
    return collectionData(moviesRef);
  }

  async removeMovie(movieId: number): Promise<void> {
    const user = this.auth.currentUser();
    if (!user) return;
    
    const movieRef = doc(this.firestore, `users/${user.uid}/movies/${movieId}`);
    await deleteDoc(movieRef);
  }
}