// chef-service.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface Besoin {
  id: number;
  titre: string;
  description: string;
  employe: {
    id: number;
    username: string;
    service: string;
  };
  dateCreation: string;
  statut: string;
  fichierCPS: string;
  motifRefus?: string;
  validationDate?: string;
}

export interface Tache {
  id: number;
  description: string;
  titre: string; // Nouveau champ
  statut: string;
  motifRefus?: string;
  dateFinale?: string; // Nouveau champ
  dureeEstimee?: string; // Nouveau champ
  dateLimite?: string; // Nouveau champ
  besoin: {
    id: number;
    titre: string;
  };
}


export interface ValidationRequest {
  valide: boolean;
  motifRefus?: string;
  titre?: string; // Nouveau champ
  dateFinale?: string; // Nouveau champ
  dureeEstimee?: string; // Nouveau champ
  dateLimite?: string; // Nouveau champ
}

@Injectable({
  providedIn: 'root'
})
export class ChefServiceService {
  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  /**
   * GET - Retrieve all besoins for a chef de service
   */
  getBesoins(chefId: number): Observable<Besoin[]> {
    const url = `${this.apiUrl}/chef-service/${chefId}/besoins`;
    console.log('📋 GET Besoins URL:', url);
    
    return this.http.get<Besoin[]>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * GET - Retrieve CPS file content for a specific besoin
   */
  getCpsFileContent(besoinId: number): Observable<string> {
    const url = `${this.apiUrl}/chef-service/besoins/${besoinId}/cps-content`;
    console.log('📄 GET CPS Content URL:', url);
    
    return this.http.get(url, { 
      headers: this.getHeaders(),
      responseType: 'text' 
    })
    .pipe(
      catchError(this.handleError)
    );
  }

  /**
   * POST - Valider ou refuser un besoin
   */
  validerBesoin(besoinId: number, valide: boolean, motifRefus?: string): Observable<Besoin> {
    const url = `${this.apiUrl}/chef-service/besoins/${besoinId}/validation`;
    const body: ValidationRequest = {
      valide: valide,
      motifRefus: motifRefus
    };
    
    console.log('✅ POST Validation Besoin URL:', url);
    console.log('📦 Body:', body);
    
    return this.http.post<Besoin>(url, body, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * GET - Retrieve tasks extracted from CPS for a besoin
   */
  getTaches(besoinId: number): Observable<Tache[]> {
    const url = `${this.apiUrl}/chef-service/besoins/${besoinId}/taches`;
    console.log('📝 GET Tâches URL:', url);
    
    return this.http.get<Tache[]>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * POST - Valider ou refuser une tâche
   */
  // Dans chef-service.service.ts
validerTache(tacheId: number, validationRequest: ValidationRequest): Observable<Tache> {
  const url = `${this.apiUrl}/chef-service/taches/${tacheId}/validation`;
  
  console.log('✅ POST Validation Tâche URL:', url);
  console.log('📦 Body:', validationRequest);
  
  return this.http.post<Tache>(url, validationRequest, { headers: this.getHeaders() })
    .pipe(
      catchError(this.handleError)
    );
}

  /**
   * GET - Test extraction endpoint
   */
  testExtraction(besoinId: number): Observable<any> {
    const url = `${this.apiUrl}/chef-service/besoins/${besoinId}/test-extraction`;
    console.log('🧪 Test Extraction URL:', url);
    
    return this.http.get<any>(url, { headers: this.getHeaders() })
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
 * POST - Créer une nouvelle tâche pour un besoin
 */
creerNouvelleTache(besoinId: number, tache: Partial<Tache>): Observable<Tache> {
  const url = `${this.apiUrl}/chef-service/besoins/${besoinId}/taches/nouvelle`;
  console.log('➕ POST Nouvelle tâche URL:', url);
  console.log('📦 Body:', tache);
  
  return this.http.post<Tache>(url, tache, { headers: this.getHeaders() })
    .pipe(
      catchError(this.handleError)
    );
}

  private handleError(error: any): Observable<never> {
    let errorMessage = 'Une erreur est survenue';
    
    if (error.error instanceof ErrorEvent) {
      errorMessage = `Erreur: ${error.error.message}`;
    } else {
      console.error('❌ Erreur backend:', error);
      
      if (error.status === 0) {
        errorMessage = 'Impossible de se connecter au serveur. Vérifiez votre connexion.';
      } else if (error.status === 405) {
        errorMessage = 'Méthode non autorisée. Le serveur attend une méthode différente.';
      } else if (error.status === 500) {
        errorMessage = 'Erreur serveur interne. Veuillez contacter l\'administrateur.';
        
        // Log détaillé pour le débogage
        if (error.error) {
          console.error('Détails de l\'erreur 500:', error.error);
        }
      } else {
        errorMessage = `Erreur ${error.status}: ${error.message}`;
      }
    }
    
    console.error('❌ Erreur API:', errorMessage);
    return throwError(() => new Error(errorMessage));
  }
}