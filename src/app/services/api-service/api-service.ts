import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient); // Modern Angular dependency injection
  
  private apiUrl = 'https://api.themoviedb.org/3/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc';
  private bearerToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzM2E4NmY4MGY4OTgyNGUzZDMxOTdmOWFhMGUzYzAyYyIsIm5iZiI6MTc4NjQ0NjM1OC42Nywic3ViIjoiNmE3YjAyMTZkYjE5ZThkZGNlMzE5Y2FhIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.2xQxyO6auWyIkrNU4jUJsUmFbKyeg_QV41YEGR5WC2c';

  getMain(): Observable<any> {
    const headers = new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`
    });

    return this.http.get<any>(this.apiUrl, { headers });
  }
}