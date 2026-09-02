import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '@services/auth/auth';
import { RouterLink, ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html'
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);

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
}