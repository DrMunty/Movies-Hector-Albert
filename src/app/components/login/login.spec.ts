import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { Login } from './login';
import { AuthService } from '@services/auth/auth';

describe('Feature: User Authentication (Login / Register)', () => {
  let component: Login;
  let fixture: ComponentFixture<Login>;
  let mockAuthService: any;
  let mockActivatedRoute: any;

  beforeEach(async () => {
    mockAuthService = {
      login: vi.fn().mockResolvedValue(undefined),
      register: vi.fn().mockResolvedValue(undefined),
      loginWithGoogle: vi.fn().mockResolvedValue(undefined)
    };

    mockActivatedRoute = {
      queryParams: of({})
    };

    await TestBed.configureTestingModule({
      imports: [Login, ReactiveFormsModule],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Login);
    component = fixture.componentInstance;
  });

  describe('Scenario: Component Initialization based on Route', () => {
    it('should default to login mode when no query params are present', () => {
      fixture.detectChanges();
      expect(component.isRegisterMode()).toBe(false);
    });

    it('should set register mode to true when query param mode is register', () => {
      mockActivatedRoute.queryParams = of({ mode: 'register' });
      fixture.detectChanges();
      expect(component.isRegisterMode()).toBe(true);
    });
  });

  describe('Scenario: Toggling Authentication Modes', () => {
    it('should switch between login and register modes and clear errors', () => {
      fixture.detectChanges();
      component.errorMessage.set('Previous error');
      
      component.toggleMode();
      
      expect(component.isRegisterMode()).toBe(true);
      expect(component.errorMessage()).toBeNull();
      
      component.toggleMode();
      
      expect(component.isRegisterMode()).toBe(false);
    });
  });

  describe('Scenario: Form Validation', () => {
    it('should mark form as invalid when fields are empty or incorrect', () => {
      fixture.detectChanges();
      expect(component.authForm.invalid).toBe(true);
      
      component.authForm.controls.email.setValue('invalid-email');
      component.authForm.controls.password.setValue('12345');
      
      expect(component.authForm.invalid).toBe(true);
    });

    it('should mark form as valid when correct data is provided', () => {
      fixture.detectChanges();
      
      component.authForm.controls.email.setValue('test@example.com');
      component.authForm.controls.password.setValue('password123');
      
      expect(component.authForm.invalid).toBe(false);
    });
  });

  describe('Scenario: Submitting the Authentication Form', () => {
    it('should call authService.login when in login mode', async () => {
      fixture.detectChanges();
      component.authForm.controls.email.setValue('test@example.com');
      component.authForm.controls.password.setValue('password123');
      
      await component.onSubmit();
      
      expect(component.isLoading()).toBe(false);
      expect(mockAuthService.login).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });

    it('should call authService.register when in register mode', async () => {
      fixture.detectChanges();
      component.isRegisterMode.set(true);
      component.authForm.controls.email.setValue('test@example.com');
      component.authForm.controls.password.setValue('password123');
      
      await component.onSubmit();
      
      expect(mockAuthService.register).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(mockAuthService.login).not.toHaveBeenCalled();
    });

    it('should not submit if the form is invalid', async () => {
      fixture.detectChanges();
      
      await component.onSubmit();
      
      expect(mockAuthService.login).not.toHaveBeenCalled();
      expect(mockAuthService.register).not.toHaveBeenCalled();
    });
  });

  describe('Scenario: Handling Authentication Errors', () => {
    it('should display invalid credentials error', async () => {
      fixture.detectChanges();
      mockAuthService.login.mockRejectedValueOnce({ code: 'auth/invalid-credential' });
      
      component.authForm.controls.email.setValue('test@example.com');
      component.authForm.controls.password.setValue('wrongpass');
      await component.onSubmit();
      
      expect(component.errorMessage()).toBe('Correo o contraseña incorrectos.');
    });

    it('should display email already in use error during registration', async () => {
      fixture.detectChanges();
      component.isRegisterMode.set(true);
      mockAuthService.register.mockRejectedValueOnce({ code: 'auth/email-already-in-use' });
      
      component.authForm.controls.email.setValue('test@example.com');
      component.authForm.controls.password.setValue('password123');
      await component.onSubmit();
      
      expect(component.errorMessage()).toBe('Este correo ya está registrado.');
    });

    it('should display a generic error for unknown issues', async () => {
      fixture.detectChanges();
      mockAuthService.login.mockRejectedValueOnce({ code: 'auth/some-random-error' });
      
      component.authForm.controls.email.setValue('test@example.com');
      component.authForm.controls.password.setValue('password123');
      await component.onSubmit();
      
      expect(component.errorMessage()).toBe('Ha ocurrido un error al autenticar.');
    });
  });

  describe('Scenario: Google Authentication', () => {
    it('should call authService.loginWithGoogle', async () => {
      fixture.detectChanges();
      
      await component.loginGoogle();
      
      expect(mockAuthService.loginWithGoogle).toHaveBeenCalled();
    });

    it('should set an error message if Google authentication fails', async () => {
      fixture.detectChanges();
      mockAuthService.loginWithGoogle.mockRejectedValueOnce(new Error('Google Error'));
      
      await component.loginGoogle();
      
      expect(component.errorMessage()).toBe('Error al conectar con Google.');
    });
  });
});