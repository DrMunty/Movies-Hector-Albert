import { Injectable, inject, signal } from '@angular/core';
import { 
  Auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  user, 
  User,
  GoogleAuthProvider,
  signInWithPopup
} from '@angular/fire/auth';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private auth = inject(Auth);
  private router = inject(Router);

  // Signal reactivo para saber si hay usuario logueado en cualquier componente
  currentUser = signal<User | null>(null);

  constructor() {
    // Escucha cambios de sesión automáticamente (si recargas la página, mantiene el login)
    user(this.auth).subscribe((u) => {
      this.currentUser.set(u);
    });
  }

  // Iniciar sesión con Correo y Contraseña
  async login(email: string, pass: string): Promise<void> {
    await signInWithEmailAndPassword(this.auth, email, pass);
    this.router.navigate(['/']);
  }

  // Registrar nuevo usuario
  async register(email: string, pass: string): Promise<void> {
    await createUserWithEmailAndPassword(this.auth, email, pass);
    this.router.navigate(['/']);
  }

  // Iniciar sesión con Google Popup
  async loginWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(this.auth, provider);
    this.router.navigate(['/']);
  }

  // Cerrar sesión
  async logout(): Promise<void> {
    await signOut(this.auth);
    this.router.navigate(['/login']);
  }
}