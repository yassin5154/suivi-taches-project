import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Employe } from '../models/employe';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmployeService {
  private apiUrl = `${environment.apiUrl}/employes`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<Employe[]> {
    return this.http.get<Employe[]>(this.apiUrl);
  }

  getById(id: number): Observable<Employe> {
    return this.http.get<Employe>(`${this.apiUrl}/${id}`);
  }

  add(employe: Employe): Observable<Employe> {
    return this.http.post<Employe>(this.apiUrl, employe);
  }

  update(id: number, employe: Employe): Observable<Employe> {
    return this.http.put<Employe>(`${this.apiUrl}/${id}`, employe);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
