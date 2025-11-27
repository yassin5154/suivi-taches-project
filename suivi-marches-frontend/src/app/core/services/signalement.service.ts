// signalement.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Signalement {
  id: number;
  numeroTache: string;
  message: string;
  dateSignalement: string;
  employe: {
    id: number;
    nom: string;
    prenom: string;
    username: string;
  };
  besoin?: {
    id: number;
    titre: string;
  };
}

export interface SignalementRequest {
  numeroTache: string;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class SignalementService {
  private apiUrl = `${environment.apiUrl}/signalements`;

  constructor(private http: HttpClient) {}

  creerSignalement(employeId: number, besoinId: number, request: SignalementRequest): Observable<Signalement> {
    return this.http.post<Signalement>(`${this.apiUrl}/employe/${employeId}/besoin/${besoinId}`, request);
  }

  getSignalementsParBesoin(besoinId: number): Observable<Signalement[]> {
    return this.http.get<Signalement[]>(`${this.apiUrl}/besoin/${besoinId}`);
  }
}