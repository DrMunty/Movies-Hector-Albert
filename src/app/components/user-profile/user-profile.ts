import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@services/auth/auth';
import { getAuth, updateProfile } from 'firebase/auth'; 

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-profile.html'
})
export class UserProfile implements OnInit {
  authService = inject(AuthService);
  private router = inject(Router);

  displayName = signal<string>('');
  photoURL = signal<string>('');
  isLoading = signal<boolean>(false);
  showSuccess = signal<boolean>(false);

  ngOnInit() {
    const user = this.authService.currentUser();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }
    this.displayName.set(user.displayName || '');
    this.photoURL.set(user.photoURL || '');
  }

  async saveProfile() {
    this.isLoading.set(true);
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (user) {
        await updateProfile(user, {
          displayName: this.displayName(),
          photoURL: this.photoURL()
        });

        this.showSuccess.set(true);
        
        setTimeout(() => {
          this.showSuccess.set(false);
          window.location.reload(); 
        }, 2000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      this.isLoading.set(false);
    }
  }

  getPreviewImage(): string {
    const url = this.photoURL();
    return url ? url : 'https://api.dicebear.com/7.x/avataaars/svg?seed=placeholder';
  }
}