import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Employe } from '../models/employe';
import { environment } from '../../../environments/environment';

export interface BesoinRequest {
  titre: string;
  description: string;
  fichierCPS: string;
}

export interface Besoin {
  id: number;
  titre: string;
  description: string;
  fichierCPS: string;
  dateCreation: string;
  statut: string;
}

interface Tache {
  id: number;
  titre: string;
  description: string;
  duree?: string;
  dureeEstimee?: string;
  dateFinale?: string;
  dateLimite?: string;
  statut?: string;
  statutValidation?: 'ACCEPTE' | 'REFUSE';
  motifRefus?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EmployeService {
  private apiUrl = `${environment.apiUrl}/employe`;
  private uploadUrl = `${environment.apiUrl}/upload`;

  constructor(private http: HttpClient) {}

  // File upload method - FIX: Use { responseType: 'text' }
  uploadFile(formData: FormData): Observable<string> {
  return this.http.post(`${this.uploadUrl}/cps`, formData, { 
    responseType: 'text' 
  }).pipe(
    catchError(this.handleError)
  );
}

  // Create besoin with JSON data
  createBesoin(employeId: number, besoinData: any): Observable<Besoin> {
    return this.http.post<Besoin>(`${this.apiUrl}/${employeId}/besoin`, besoinData)
      .pipe(
        catchError(this.handleError)
      );
  }

  getBesoins(employeId: number): Observable<Besoin[]> {
    return this.http.get<Besoin[]>(`${this.apiUrl}/${employeId}/besoins`)
      .pipe(
        catchError(this.handleError)
      );
  }

  getAll(): Observable<Employe[]> {
    return this.http.get<Employe[]>(this.apiUrl)
      .pipe(
        catchError(this.handleError)
      );
  }

  getById(id: number): Observable<Employe> {
    return this.http.get<Employe>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  add(employe: Employe): Observable<Employe> {
    return this.http.post<Employe>(this.apiUrl, employe)
      .pipe(
        catchError(this.handleError)
      );
  }

  update(id: number, employe: Employe): Observable<Employe> {
    return this.http.put<Employe>(`${this.apiUrl}/${id}`, employe)
      .pipe(
        catchError(this.handleError)
      );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Une erreur est survenue';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Code d'erreur: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // NOUVEAU: Obtenir les besoins du service
  getBesoinsService(employeId: number): Observable<Besoin[]> {
    return this.http.get<Besoin[]>(`${this.apiUrl}/${employeId}/besoins-service`)
      .pipe(
        catchError(this.handleError)
      );
  }

   // NOUVEAU: Modifier un besoin
  modifierBesoin(employeId: number, besoinId: number, besoinData: any): Observable<Besoin> {
    return this.http.put<Besoin>(`${this.apiUrl}/${employeId}/besoin/${besoinId}`, besoinData)
      .pipe(
        catchError(this.handleError)
      );
  }

  // NOUVEAU: Signaler une tâche
  signalerTache(employeId: number, besoinId: number, signalement: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${employeId}/besoin/${besoinId}/signaler-tache`, signalement)
      .pipe(
        catchError(this.handleError)
      );
  }

  // NOUVEAU: Valider une tâche
  validerTache(employeId: number, besoinId: number, validation: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${employeId}/besoin/${besoinId}/valider-tache`, validation)
      .pipe(
        catchError(this.handleError)
      );
  }

  // NOUVEAU: Obtenir le contenu du fichier CPS
  getCpsContent(besoinId: number): Observable<string> {
    return this.http.get(`${environment.apiUrl}/files/besoin/${besoinId}/cps`, { 
      responseType: 'text' 
    }).pipe(
      catchError(this.handleError)
    );
  }

  // NOUVEAU: Obtenir les tâches d'un besoin
  getTachesByBesoinId(besoinId: number): Observable<Tache[]> {
    return this.http.get<Tache[]>(`${this.apiUrl}/besoin/${besoinId}/taches`)
      .pipe(
        catchError(this.handleError)
      );
  }
}