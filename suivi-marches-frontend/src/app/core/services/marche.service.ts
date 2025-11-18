import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Marche } from '../models/marche';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MarcheService {
  private apiUrl = `${environment.apiUrl}/marches`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Marche[]> {
    return this.http.get<Marche[]>(this.apiUrl);
  }

  getById(id: number): Observable<Marche> {
    return this.http.get<Marche>(`${this.apiUrl}/${id}`);
  }

  add(marche: Marche): Observable<Marche> {
    return this.http.post<Marche>(this.apiUrl, marche);
  }

  update(id: number, marche: Marche): Observable<Marche> {
    return this.http.put<Marche>(`${this.apiUrl}/${id}`, marche);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
