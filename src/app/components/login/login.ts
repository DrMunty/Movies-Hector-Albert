import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@services/auth/auth';
import { RouterLink, ActivatedRoute} from '@angular/router';
import { MOCK_USERS } from '../../data/mock-users';

// IMPORTACIONES NECESARIAS PARA EL SCRIPT DE INYECCIÓN
import { Auth, createUserWithEmailAndPassword, updateProfile } from '@angular/fire/auth';
import { Firestore, doc, setDoc } from '@angular/fire/firestore';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html'
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

  // Inyectamos las instancias de Firebase para el script
  private auth = inject(Auth);
  private firestore = inject(Firestore);

  isRegisterMode = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isLoading = signal<boolean>(false);

  authForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['mode'] === 'register') {
        this.isRegisterMode.set(true);
      } else {
        this.isRegisterMode.set(false);
      }
    });
  }

  toggleMode(): void {
    this.isRegisterMode.update(val => !val);
    this.errorMessage.set(null);
  }

  async onSubmit(): Promise<void> {
    if (this.authForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.authForm.value;

    try {
      if (this.isRegisterMode()) {
        await this.authService.register(email!, password!);
      } else {
        await this.authService.login(email!, password!);
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found') {
        this.errorMessage.set('Correo o contraseña incorrectos.');
      } else if (err.code === 'auth/email-already-in-use') {
        this.errorMessage.set('Este correo ya está registrado.');
      } else {
        this.errorMessage.set('Ha ocurrido un error al autenticar.');
      }
    } finally {
      this.isLoading.set(false);
    }
  }

  async loginGoogle(): Promise<void> {
    try {
      await this.authService.loginWithGoogle();
    } catch (err) {
      this.errorMessage.set('Error al conectar con Google.');
    }
  }


  async injectMockData() {
    if (!confirm('¿Inyectar los 20 usuarios? Esto puede tardar unos segundos.')) return;

    console.log('Iniciando inyección de usuarios...');
    this.isLoading.set(true);

    for (const u of MOCK_USERS) {
      try {
        // 1. Crear cuenta en Firebase Auth
        const cred = await createUserWithEmailAndPassword(this.auth, u.email, u.password);
        const uid = cred.user.uid;

        // 2. Asignar el nombre visible al perfil
        await updateProfile(cred.user, { displayName: u.name });

        // 3. Subir películas favoritas
        for (const fav of u.favorites) {
          await setDoc(doc(this.firestore, `users/${uid}/movies/${fav.id}`), {
            id: fav.id, title: fav.title, isFavorite: true, addedAt: Date.now()
          }, { merge: true });
        }

        // 4. Subir películas de la Watchlist
        for (const wl of u.watchLater) {
          await setDoc(doc(this.firestore, `users/${uid}/movies/${wl.id}`), {
            id: wl.id, title: wl.title, inWatchlist: true, addedAt: Date.now()
          }, { merge: true });
        }

        // 5. Subir películas valoradas
        for (const r of u.rated) {
          await setDoc(doc(this.firestore, `users/${uid}/movies/${r.id}`), {
            id: r.id, title: r.title, isRated: true, userRating: r.rating, addedAt: Date.now()
          }, { merge: true });
        }

        console.log(`✅ ${u.name} inyectado correctamente.`);
      } catch (error: any) {
        if (error.code === 'auth/email-already-in-use') {
          console.warn(`⚠️ ${u.name} ya existe. Saltando...`);
        } else {
          console.error(`❌ Error inyectando a ${u.name}:`, error);
        }
      }
    }
    
    this.isLoading.set(false);
    alert('¡Inyección completada! Puedes borrar este botón.');
  }
}