import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeService, Besoin as ServiceBesoin } from '../../../../core/services/employe.service';

interface Tache {
  id: number;
  titre: string;
  description: string;
  dateFinale: string; // Date de début
  dureeEstimee: string; // Durée estimée (ex: "5 jours")
  dateLimite?: string;
  statut: 'EN_ATTENTE' | 'ACCEPTEE' | 'REFUSEE' | 'TERMINEE';
  motifRefus?: string;
}

// Utiliser la même interface que le service ou l'adapter
interface Besoin {
  id: number;
  titre: string;
  description: string;
  dateCreation: string;
  validationDate?: string; // Rendre optionnel si pas toujours présent
  statut: string;
  taches?: Tache[];
  employe?: {
    id: number;
    nom: string;
    prenom: string;
    service: string;
  };
  // Ajouter les champs manquants
  fichierCPS?: string;
  motifRefus?: string;
  employe_id?: number;
}

interface TachesParBesoin {
  besoin: Besoin;
  taches: Tache[];
  expanded?: boolean;
}

@Component({
  selector: 'app-suivi',
  templateUrl: './suivi.component.html',
  styleUrls: ['./suivi.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SuiviComponent implements OnInit {
  tachesParBesoin: TachesParBesoin[] = [];
  loading: boolean = true;
  now: Date = new Date();
  employeId: number = 4; // À adapter selon l'authentification

  constructor(
    private http: HttpClient,
    private employeService: EmployeService
  ) {}

  ngOnInit(): void {
    this.loadBesoinsAcceptes();
  }

  loadBesoinsAcceptes(): void {
    this.loading = true;
    this.employeService.getBesoinsAcceptes(this.employeId)
      .subscribe({
        next: (besoins: any[]) => { // Utiliser any[] temporairement pour debug
          console.log('Besoins reçus:', besoins);
          this.processBesoins(besoins);
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des besoins acceptés:', error);
          this.loading = false;
          this.loadMockData();
        }
      });
  }

  // Nouvelle méthode pour traiter les données reçues
  private processBesoins(besoins: any[]): void {
    this.tachesParBesoin = besoins
      .filter(besoin => {
        const hasTaches = besoin.taches && besoin.taches.length > 0;
        const hasValidTaches = hasTaches && besoin.taches.some((tache: any) => 
          tache.statut === 'ACCEPTEE' || tache.statut === 'TERMINEE'
        );
        return hasValidTaches;
      })
      .map(besoin => {
        // Normaliser les données du besoin
        const besoinNormalise: Besoin = {
          id: besoin.id,
          titre: besoin.titre,
          description: besoin.description,
          dateCreation: besoin.dateCreation,
          validationDate: besoin.validationDate || besoin.validation_date,
          statut: besoin.statut,
          taches: besoin.taches,
          employe: besoin.employe || {
            id: besoin.employe_id,
            nom: 'Non spécifié',
            prenom: 'Non spécifié',
            service: 'Non spécifié'
          }
        };

        return {
          besoin: besoinNormalise,
          taches: (besoin.taches || []).filter((tache: any) => 
            tache.statut === 'ACCEPTEE' || tache.statut === 'TERMINEE'
          ),
          expanded: false
        };
      });

    console.log('Tâches par besoin:', this.tachesParBesoin);
  }

  // Le reste du code reste inchangé...
  loadMockData(): void {
    this.tachesParBesoin = [
      {
        besoin: {
          id: 15,
          titre: "CPS1",
          description: "Description des tâches urgentes et quotidiennes",
          dateCreation: "2025-11-25",
          validationDate: "2025-11-25",
          statut: "ACCEPTE",
          employe: {
            id: 4,
            nom: "Zouhair",
            prenom: "Amina",
            service: "Service des Finances"
          },
          taches: []
        },
        taches: [
          {
            id: 35,
            titre: "Collecte et intégration des données financières",
            description: "Rassembler toutes les données des dépenses, recettes, engagements, mandats et opérations bancaires des 12 derniers mois. Vérifier l'exactitude des chiffres.",
            dateFinale: "2025-03-10",
            dureeEstimee: "5 jours",
            statut: "TERMINEE"
          },
          {
            id: 36,
            titre: "Conception du module de suivi budgétaire",
            description: "Développer un module permettant de suivre en temps réel",
            dateFinale: "2025-03-17",
            dureeEstimee: "7 jours",
            statut: "ACCEPTEE"
          }
        ],
        expanded: false
      }
    ];
  }

  // Convertir la durée estimée en nombre de jours
  parseDureeEstimee(duree: string): number {
    if (!duree) return 7;
    const match = duree.match(/(\d+)\s*jour/);
    return match ? parseInt(match[1]) : 7; // Par défaut 7 jours
  }

  calculateDeadline(dateFinale: string, dureeEstimee: string): Date {
    const start = new Date(dateFinale);
    const dureeJours = this.parseDureeEstimee(dureeEstimee);
    const deadline = new Date(start);
    deadline.setDate(deadline.getDate() + dureeJours);
    return deadline;
  }

  calculateProgress(task: Tache): number {
    if (task.statut === 'TERMINEE') {
      return 100;
    }

    const start = new Date(task.dateFinale);
    const deadline = this.calculateDeadline(task.dateFinale, task.dureeEstimee);
    const now = new Date();

    // Si la tâche n'a pas encore commencé
    if (now < start) {
      return 0;
    }

    // Si la tâche est en retard
    if (now > deadline) {
      return 100; // Montrer comme terminé visuellement mais en rouge
    }

    const totalDuration = deadline.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();

    const progress = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
    return Math.round(progress);
  }

  isTaskLate(task: Tache): boolean {
    if (task.statut === 'TERMINEE') {
      return false;
    }
    const deadline = this.calculateDeadline(task.dateFinale, task.dureeEstimee);
    return new Date() > deadline;
  }

  generateCompletionNote(task: Tache): string | null {
    if (task.statut !== 'TERMINEE') {
      return null;
    }

    const start = new Date(task.dateFinale);
    const dureeJours = this.parseDureeEstimee(task.dureeEstimee);
    const deadline = new Date(start);
    deadline.setDate(deadline.getDate() + dureeJours);
    
    // Pour les tâches terminées, on utilise la date actuelle comme date de fin
    const completionDate = new Date();
    const diffTime = deadline.getTime() - completionDate.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      return `Cette tâche a été terminée ${diffDays} jour${diffDays > 1 ? 's' : ''} avant la durée estimée.`;
    } else if (diffDays < 0) {
      return `Cette tâche a été terminée avec ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''} de retard.`;
    } else {
      return "Cette tâche a été terminée dans les délais prévus.";
    }
  }

  markTaskAsDone(taskId: number): void {
    this.employeService.terminerTache(taskId)
      .subscribe({
        next: () => {
          // Mise à jour locale de l'interface
          this.tachesParBesoin = this.tachesParBesoin.map(group => ({
            ...group,
            taches: group.taches.map(task =>
              task.id === taskId
                ? { ...task, statut: 'TERMINEE' }
                : task
            )
          }));
        },
        error: (error) => {
          console.error('Erreur lors de la complétion de la tâche:', error);
          alert('Erreur lors de la mise à jour de la tâche.');
        }
      });
  }

  toggleBesoin(besoinId: number): void {
    const group = this.tachesParBesoin.find(g => g.besoin.id === besoinId);
    if (group) {
      group.expanded = !group.expanded;
    }
  }

  getStatusBadge(statut: string, isLate: boolean): { color: string; text: string } {
    if (statut === 'TERMINEE') {
      return { color: 'status-completed', text: 'Terminée' };
    }
    if (isLate) {
      return { color: 'status-late', text: 'En Retard' };
    }
    return { color: 'status-progress', text: 'En Cours' };
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'Non spécifiée';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }

  // Nouvelle méthode pour formater la durée
  formatDuree(duree: string): string {
    return duree || 'Non spécifiée';
  }

  // Méthode pour obtenir le nom de l'employé de façon sécurisée
  getEmployeName(besoin: Besoin): string {
    if (!besoin.employe) return 'Auteur inconnu';
    return `${besoin.employe.prenom} ${besoin.employe.nom}`;
  }

  getEmployeService(besoin: Besoin): string {
    if (!besoin.employe) return 'Service inconnu';
    return besoin.employe.service;
  }
}