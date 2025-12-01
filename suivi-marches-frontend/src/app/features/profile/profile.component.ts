import { Component, OnInit } from '@angular/core';
import { AuthService, UserInfo } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  profile: any = {
    nom: '',
    prenom: '',
    email: '',
    username: ''
  };
  newPassword: string = '';

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadUserProfile();
  }

  loadUserProfile() {
    // Récupérer les informations de l'utilisateur connecté
    const currentUser = this.authService.getCurrentUser();
    
    if (currentUser) {
      // Utiliser les informations de l'utilisateur connecté
      this.profile = {
        nom: this.extractLastName(currentUser.name),
        prenom: this.extractFirstName(currentUser.name),
        email: currentUser.email || `${currentUser.username}@example.com`,
        username: currentUser.username
      };
    } else {
      console.warn('Aucun utilisateur connecté trouvé');
    }
  }

  // Méthode pour extraire le prénom du nom complet
  private extractFirstName(fullName: string): string {
    return fullName.split(' ')[0] || '';
  }

  // Méthode pour extraire le nom de famille du nom complet
  private extractLastName(fullName: string): string {
    const parts = fullName.split(' ');
    return parts.length > 1 ? parts.slice(1).join(' ') : '';
  }

  updateProfile() {
    // Ici vous pouvez implémenter la logique de mise à jour si nécessaire
    // Pour l'instant, on va juste afficher un message
    console.log('Profil à mettre à jour:', this.profile);
    alert("Profil mis à jour ! (Fonctionnalité de mise à jour à implémenter)");
    this.newPassword = '';
  }
}