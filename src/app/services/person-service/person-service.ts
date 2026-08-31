import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@env/environment';

import { Person, PersonDetail } from '@models/person-interface';
import { TmdbResponse } from '@models/tmdb-interface';

@Injectable({
  providedIn: 'root'
})
export class PersonService {
  private http = inject(HttpClient);
  private baseUrl = environment.tmdbBaseUrl;
  private bearerToken = environment.tmdbBearerToken;

  private get headers(): HttpHeaders {
    return new HttpHeaders({
      'accept': 'application/json',
      'Authorization': `Bearer ${this.bearerToken}`
    });
  }

  /**
   * Fetches popular people or searches by person name
   */
  getPeople(query?: string, page: number = 1): Observable<TmdbResponse<Person>> {
    let httpParams = new HttpParams().set('page', page);

    if (query && query.trim() !== '') {
      httpParams = httpParams.set('query', query);
      return this.http.get<TmdbResponse<Person>>(`${this.baseUrl}/search/person`, { headers: this.headers, params: httpParams });
    }

    return this.http.get<TmdbResponse<Person>>(`${this.baseUrl}/person/popular`, { headers: this.headers, params: httpParams });
  }

  /**
   * Fetches full biographical details for an actor/director by ID
   */
 getPersonDetails(personId: number): Observable<PersonDetail> {
    return this.http.get<PersonDetail>(`${this.baseUrl}/person/${personId}?append_to_response=combined_credits`, { headers: this.headers });
  }
}