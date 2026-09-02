import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { debounceTime, distinctUntilChanged, Subject, takeUntil, switchMap, of } from 'rxjs';
import { ApiService } from '@services/api-service/api-service';
import { AuthService } from '@services/auth/auth';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, ReactiveFormsModule, CommonModule], 
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit, OnDestroy {
  searchInput = new FormControl('');
  private destroy$ = new Subject<void>();
  
  private apiService = inject(ApiService);
  authService = inject(AuthService)
  currentUser = this.authService.currentUser;
  searchResults = signal<any[]>([]);
  isProfileMenuOpen = signal<boolean>(false);

  ngOnInit(): void {
    this.searchInput.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((query) => {
          if (!query || query.trim() === '') {
            return of({ results: [] });
          }
          return this.apiService.searchMulti(query.trim());
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((apiResponse) => {
        const top5 = apiResponse.results ? apiResponse.results.slice(0, 5) : [];
        this.searchResults.set(top5);
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  closeSearch(): void {
    this.searchInput.setValue('');
    this.searchResults.set([]);
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen.update(val => !val);
  }

  async logout(): Promise<void> {
    this.isProfileMenuOpen.set(false);
    await this.authService.logout();
  }
}