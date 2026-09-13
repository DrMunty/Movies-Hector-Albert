import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ApiService } from '@services/api-service/api-service';
import { PersonDetail, KnownForMedia } from '@models/person-interface';

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

  heroBackdrop = computed(() => {
    const list = this.knownForList();
    const itemWithBackdrop = list.find(item => item.backdrop_path);
    return itemWithBackdrop?.backdrop_path ?? null; 
  });

 knownForList = computed<KnownForMedia[]>(() => {
    const data = this.person();
    if (!data) return [];

    let list: KnownForMedia[] = [];

    if (data.known_for && data.known_for.length > 0) {
      list = data.known_for;
    } 

    else if (data.known_for_department === 'Directing' && data.combined_credits?.crew) {

      list = data.combined_credits.crew.filter((item: any) => item.job === 'Director');

      if (list.length === 0 && data.combined_credits?.cast) {
        list = data.combined_credits.cast;
      }
    } 

    else if (data.combined_credits?.cast) {
      list = data.combined_credits.cast;
    }


    return (list as KnownForMedia[])
      .filter(item => item.poster_path)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
  });


  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      if (idParam) {
        this.fetchPerson(Number(idParam));
      }
    });
  }

  fetchPerson(id: number): void {
    this.isLoading.set(true);
    this.apiService.getPersonDetails(id).subscribe({
      next: (data) => {
        this.person.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getImageUrl(path: string | null, size: string = 'w500'): string {
    return path 
      ? `https://image.tmdb.org/t/p/${size}${path}`
      : 'assets/images/placeholder.png';
  }

  getMediaTitle(item: KnownForMedia): string {
    return 'title' in item ? item.title : item.name;
  }
}
