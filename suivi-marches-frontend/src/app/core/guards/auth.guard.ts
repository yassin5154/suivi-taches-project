import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Vérification des rôles si spécifiés dans la route
    const expectedRole = route.data['role'];
    if (expectedRole && !this.authService.hasRole(expectedRole)) {
      this.router.navigate(['/unauthorized']);
      return false;
    }

    return true;
  }
}