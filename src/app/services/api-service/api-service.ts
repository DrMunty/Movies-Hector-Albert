import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  
  private baseUrl = 'https://api.themoviedb.org/3';
  private bearerToken = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiIzM2E4NmY4MGY4OTgyNGUzZDMxOTdmOWFhMGUzYzAyYyIsIm5iZiI6MTc4NjQ0NjM1OC42Nywic3ViIjoiNmE3YjAyMTZkYjE5ZThkZGNlMzE5Y2FhIiwic2NvcGVzIjpbImFwaV9yZWFkIl0sInZlcnNpb24iOjF9.2xQxyO6auWyIkrNU4jUJsUmFbKyeg_QV41YEGR5WC2c';
  
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`
    });
  }

  getMain(): Observable<any> {
    const url = `${this.baseUrl}/discover/movie?include_adult=false&include_video=false&language=en-US&page=1&sort_by=popularity.desc`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

searchMulti(query: string): Observable<any> {
    const safeQuery = encodeURIComponent(query);
    const url = `${this.baseUrl}/search/multi?query=${safeQuery}&include_adult=false&language=en-US&page=1`;
    
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getFilteredMovies(page: number = 1, filters: any = {}): Observable<any> {
    
    if (filters.query && filters.query.trim() !== '') {
      const safeQuery = encodeURIComponent(filters.query.trim());
      const url = `${this.baseUrl}/search/movie?query=${safeQuery}&page=${page}&include_adult=false&language=en-US`;
      return this.http.get<any>(url, { headers: this.getHeaders() });
    } 
    
    let url = `${this.baseUrl}/discover/movie?include_adult=false&language=en-US&page=${page}`;
    
    if (filters.sort_by) {
      url += `&sort_by=${filters.sort_by}`;
    }
    
    if (filters.with_genres) {
      url += `&with_genres=${filters.with_genres}`;
    }
    
    if (filters.vote_average_gte) {
      url += `&vote_average.gte=${filters.vote_average_gte}`;
    }

    return this.http.get<any>(url, { headers: this.getHeaders() });
  }

  getGenres(): Observable<any> {
    const url = `${this.baseUrl}/genre/movie/list?language=en-US`;
    return this.http.get<any>(url, { headers: this.getHeaders() });
  }
}