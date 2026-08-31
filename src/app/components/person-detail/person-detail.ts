import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '@services/api-service/api-service';
import { PersonDetail } from '@models/person-interface';

@Component({
  selector: 'app-person-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './person-detail.html'
})
export class PersonDetails implements OnInit {
  private route = inject(ActivatedRoute);
  private apiService = inject(ApiService);

  person = signal<PersonDetail | null>(null);
  isLoading = signal<boolean>(true);
  hasError = signal<boolean>(false);

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.fetchPersonDetails(Number(idParam));
      }
    });
  }

  fetchPersonDetails(personId: number): void {
    this.isLoading.set(true);
    this.hasError.set(false);

    this.apiService.getPersonDetails(personId).subscribe({
      next: (data) => {
        this.person.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Failed to load person details:', err);
        this.hasError.set(true);
        this.isLoading.set(false);
      }
    });
  }

  getImageUrl(path: string | null): string {
    return path
      ? 'https://image.tmdb.org/t/p/w500${path}'
      : 'assets/images/placeholder-profile.png';
  }
}