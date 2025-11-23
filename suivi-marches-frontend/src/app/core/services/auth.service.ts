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
  id?: number; // Add this field to your backend response
}

export interface UserInfo {
  id?: number; // Add this field
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
            id: response.id, // Store the ID from backend
            username: response.username,
            role: response.role,
            name: this.formatName(response.username),
            avatar: ''
          };
          this.saveUserInfo(userInfo);
        })
      );
  }

  // Add this method to get current user ID
  getCurrentUserId(): number | null {
  const user = this.getCurrentUser();
  console.log('Current user from storage:', user);
  
  if (user && user.id) {
    console.log('User ID from storage:', user.id, 'Type:', typeof user.id);
    return Number(user.id); // Assurez-vous que c'est un nombre
  }
  
  // Fallback: Essayez d'extraire de JWT
  const token = this.getToken();
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      console.log('JWT payload:', payload);
      const userId = payload.id || payload.userId || payload.sub;
      return userId ? Number(userId) : null;
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }
  
  console.warn('No user ID found');
  return null;
}

  // Extract user ID from JWT token as fallback
  private extractUserIdFromToken(): number | null {
    const token = this.getToken();
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Try different possible field names for user ID
        return payload.id || payload.userId || payload.sub || null;
      } catch (error) {
        console.error('Error decoding token:', error);
        return null;
      }
    }
    return null;
  }

  // Rest of your existing methods remain the same...
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