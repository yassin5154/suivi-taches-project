import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, BehaviorSubject } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  type: string;
  username: string;
  role: string;
}

export interface UserInfo {
  username: string;
  role: string;
  name: string;
  email?: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<UserInfo | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  login(credentials: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap((response: AuthResponse) => {
          this.saveToken(response.token);
          const userInfo: UserInfo = {
            username: response.username,
            role: response.role,
            name: this.formatName(response.username),
            avatar: ''
          };
          this.saveUserInfo(userInfo);
        })
      );
  }

  register(data: any): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data);
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user_info');
    this.currentUserSubject.next(null);
  }

  saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  saveUserInfo(userInfo: UserInfo): void {
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    this.currentUserSubject.next(userInfo);
  }

  getCurrentUser(): UserInfo | null {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
  }

  getUserRole(): string | null {
    const user = this.getCurrentUser();
    return user ? user.role : null;
  }

  getUsername(): string | null {
    const user = this.getCurrentUser();
    return user ? user.username : null;
  }

  private loadUserFromStorage(): void {
    const userInfo = this.getCurrentUser();
    if (userInfo) {
      this.currentUserSubject.next(userInfo);
    }
  }

  private formatName(username: string): string {
    return username
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    return this.getUserRole() === role;
  }

  isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  isChefService(): boolean {
    return this.hasRole('CHEF');
  }

  isEmploye(): boolean {
    return this.hasRole('EMPLOYE');
  }

  getRoleDisplayName(role?: string): string {
    const userRole = role || this.getUserRole() || '';
    const roleNames: { [key: string]: string } = {
      'ADMIN': 'Administrateur',
      'CHEF': 'Chef de Service',
      'EMPLOYE': 'Employé'
    };
    return roleNames[userRole] || 'Utilisateur';
  }
}