// validation-taches.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChefServiceService, Besoin, Tache, ValidationRequest } from '../../../../core/services/chefservice.service';
import { SignalementService, Signalement } from '../../../../core/services/signalement.service';

@Component({
  selector: 'app-validation-taches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './validation-taches.component.html',
  styleUrls: ['./validation-taches.component.css']
})
export class ValidationTachesComponent implements OnInit {

  // Data properties
  besoins: Besoin[] = [];
  selectedBesoin: Besoin | null = null;
  cpsContent: string = '';
  taches: Tache[] = [];
  signalements: Signalement[] = []; // Nouveau: Liste des signalements

  // UI state properties
  showTasksSection: boolean = false;
  showRefuseModal: boolean = false;
  refusalReason: string = '';
  refuseType: 'besoin' | 'tache' = 'besoin';
  selectedBesoinId: number | null = null;
  selectedTacheId: number | null = null;
  showAddTaskForm: boolean = false;

  // Loading states
  isLoadingBesoins: boolean = false;
  isLoadingCps: boolean = false;
  isLoadingTaches: boolean = false;
  isLoadingSignalements: boolean = false; // Nouveau: Chargement signalements

  // Notification
  showNotification: boolean = false;
  notificationMessage: string = '';
  notificationType: 'success' | 'error' = 'success';

  // Nouvelle tâche
  newTask: any = {
    titre: '',
    description: '',
    dateFinale: '',
    dureeEstimee: '',
    dateLimite: ''
  };

  constructor(
    private chefServiceService: ChefServiceService,
    private signalementService: SignalementService // Ajouter le service signalement
  ) {}

  ngOnInit(): void {
    console.log('🔄 Initialisation du composant ValidationTachesComponent');
    this.loadBesoins();
  }

  /**
   * Load all besoins for the chef de service
   */
  loadBesoins(): void {
    this.isLoadingBesoins = true;
    this.besoins = [];
    
    const chefId = this.getChefId();
    console.log('🆔 Chargement des besoins pour le chef ID:', chefId);

    this.chefServiceService.getBesoins(chefId).subscribe({
      next: (data: Besoin[]) => {
        this.besoins = data;
        this.isLoadingBesoins = false;
        console.log('✅ Besoins chargés avec succès:', data.length);
        
        if (data.length === 0) {
          console.log('ℹ️ Aucun besoin trouvé pour ce service');
        } else {
          data.forEach(besoin => {
            console.log(`📋 Besoin ${besoin.id}: ${besoin.titre} (${besoin.statut})`);
          });
        }
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des besoins:', error);
        this.isLoadingBesoins = false;
        this.showErrorNotification('Erreur lors du chargement des besoins: ' + error.message);
      }
    });
  }

  /**
   * Open a besoin and load its details
   */
  openBesoin(besoin: Besoin): void {
    console.log('🔍 Ouverture du besoin:', besoin.id, besoin.titre);
    this.selectedBesoin = besoin;
    this.cpsContent = ''; // Reset CPS content
    this.taches = []; // Reset tasks
    this.signalements = []; // Reset signalements

    // Charger automatiquement le contenu CPS
    this.loadCpsFile(besoin.id);

    // Charger les signalements pour ce besoin
    this.loadSignalements(besoin.id);

    // If besoin is already accepted, load tasks
    if (besoin.statut === 'ACCEPTE') {
      this.showTasksSection = true;
      this.loadTaches(besoin.id);
    } else {
      this.showTasksSection = false;
    }
  }

  /**
   * Load CPS file content for a besoin
   */
  loadCpsFile(besoinId: number): void {
    this.isLoadingCps = true;
    this.cpsContent = '';

    console.log('📄 Chargement du fichier CPS pour le besoin:', besoinId);

    this.chefServiceService.getCpsFileContent(besoinId).subscribe({
      next: (content: string) => {
        this.cpsContent = content;
        this.isLoadingCps = false;
        console.log('✅ Fichier CPS chargé avec succès');
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement du fichier CPS:', error);
        
        // Message d'erreur plus spécifique
        if (error.message.includes('Aucun fichier')) {
          this.cpsContent = '❌ Aucun fichier CPS trouvé pour ce besoin.';
        } else if (error.message.includes('introuvable')) {
          this.cpsContent = '❌ Fichier CPS introuvable sur le serveur.';
        } else if (error.message.includes('Erreur lors de la lecture')) {
          this.cpsContent = '❌ Erreur de lecture du fichier CPS. Le fichier peut être corrompu.';
        } else {
          this.cpsContent = '❌ Impossible de charger le contenu du fichier CPS.';
        }
        
        this.isLoadingCps = false;
        this.showErrorNotification('Erreur lors du chargement du fichier CPS: ' + error.message);
      }
    });
  }

  /**
   * Load signalements for a besoin
   */
  loadSignalements(besoinId: number): void {
    this.isLoadingSignalements = true;
    this.signalements = [];

    console.log('📢 Chargement des signalements pour le besoin:', besoinId);

    this.signalementService.getSignalementsParBesoin(besoinId).subscribe({
      next: (signalements: Signalement[]) => {
        this.signalements = signalements;
        this.isLoadingSignalements = false;
        console.log('✅ Signalements chargés avec succès:', signalements.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des signalements:', error);
        this.isLoadingSignalements = false;
        // Ne pas afficher d'erreur à l'utilisateur pour les signalements
      }
    });
  }

  /**
   * Accept a besoin
   */
  acceptBesoin(besoinId: number): void {
    if (!confirm('Êtes-vous sûr de vouloir accepter ce besoin ? Cette action extraira les tâches du fichier CPS.')) {
      return;
    }

    console.log('✅ Acceptation du besoin:', besoinId);

    this.chefServiceService.validerBesoin(besoinId, true).subscribe({
      next: (updatedBesoin: Besoin) => {
        // Update besoin status in local array
        const besoinIndex = this.besoins.findIndex(b => b.id === besoinId);
        if (besoinIndex !== -1) {
          this.besoins[besoinIndex] = updatedBesoin;
        }

        // Update selected besoin
        if (this.selectedBesoin?.id === besoinId) {
          this.selectedBesoin = updatedBesoin;
          this.showTasksSection = true;
          this.loadTaches(besoinId);
        }

        console.log('✅ Besoin accepté avec succès');
        this.showSuccessNotification('Besoin accepté avec succès. Les tâches ont été extraites du CPS.');
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'acceptation du besoin:', error);
        this.showErrorNotification('Erreur lors de l\'acceptation du besoin: ' + error.message);
      }
    });
  }

  /**
   * Open refuse modal
   */
  openRefuseModal(type: 'besoin' | 'tache', besoinId?: number | null, tacheId?: number | null): void {
    console.log('🗑️ Ouverture modal refus - Type:', type, 'Besoin ID:', besoinId, 'Tâche ID:', tacheId);
    
    this.refuseType = type;
    this.selectedBesoinId = besoinId || null;
    this.selectedTacheId = tacheId || null;
    this.refusalReason = '';
    this.showRefuseModal = true;
  }

  /**
   * Close refuse modal
   */
  closeRefuseModal(): void {
    console.log('❌ Fermeture modal refus');
    this.showRefuseModal = false;
    this.refusalReason = '';
    this.selectedBesoinId = null;
    this.selectedTacheId = null;
  }

  /**
   * Confirm refusal (besoin or tache)
   */
  confirmRefusal(): void {
    if (!this.refusalReason.trim()) {
      this.showErrorNotification('Veuillez saisir une raison pour le refus.');
      return;
    }

    console.log('✅ Confirmation refus - Type:', this.refuseType, 'Raison:', this.refusalReason);

    if (this.refuseType === 'besoin' && this.selectedBesoinId) {
      this.refuseBesoin(this.selectedBesoinId, this.refusalReason);
    } else if (this.refuseType === 'tache' && this.selectedTacheId) {
      this.refuseTache(this.selectedTacheId, this.refusalReason);
    } else {
      console.error('❌ Type de refus ou ID invalide');
      this.showErrorNotification('Erreur: type de refus ou ID invalide.');
    }

    this.closeRefuseModal();
  }

  /**
   * Refuse a besoin with reason
   */
  refuseBesoin(besoinId: number, reason: string): void {
    console.log('❌ Refus du besoin:', besoinId, 'Raison:', reason);

    this.chefServiceService.validerBesoin(besoinId, false, reason).subscribe({
      next: (updatedBesoin: Besoin) => {
        // Update besoin status in local array
        const besoinIndex = this.besoins.findIndex(b => b.id === besoinId);
        if (besoinIndex !== -1) {
          this.besoins[besoinIndex] = updatedBesoin;
        }

        // Update selected besoin
        if (this.selectedBesoin?.id === besoinId) {
          this.selectedBesoin = updatedBesoin;
          this.showTasksSection = false;
          this.taches = [];
        }

        console.log('✅ Besoin refusé avec succès');
        this.showSuccessNotification('Besoin refusé avec succès');
      },
      error: (error) => {
        console.error('❌ Erreur lors du refus du besoin:', error);
        this.showErrorNotification('Erreur lors du refus du besoin: ' + error.message);
      }
    });
  }

  /**
   * Load tasks for a besoin
   */
  loadTaches(besoinId: number): void {
    this.isLoadingTaches = true;
    this.taches = [];

    console.log('📝 Chargement des tâches pour le besoin:', besoinId);

    this.chefServiceService.getTaches(besoinId).subscribe({
      next: (data: Tache[]) => {
        this.taches = data;
        this.isLoadingTaches = false;
        console.log('✅ Tâches chargées avec succès:', data.length);
      },
      error: (error) => {
        console.error('❌ Erreur lors du chargement des tâches:', error);
        this.isLoadingTaches = false;
        this.showErrorNotification('Erreur lors du chargement des tâches: ' + error.message);
      }
    });
  }

  /**
   * Accept a task
   */
  acceptTache(tache: Tache): void {
    if (!this.canAcceptTache(tache)) {
      this.showErrorNotification('Veuillez remplir tous les champs obligatoires (titre, date finale, durée estimée)');
      return;
    }

    if (!confirm('Êtes-vous sûr de vouloir valider cette tâche ?')) {
      return;
    }

    console.log('✅ Acceptation de la tâche:', tache.id);

    const validationRequest: ValidationRequest = {
      valide: true,
      titre: tache.titre,
      dateFinale: tache.dateFinale,
      dureeEstimee: tache.dureeEstimee,
      dateLimite: tache.dateLimite
    };

    this.chefServiceService.validerTache(tache.id, validationRequest).subscribe({
      next: (updatedTache: Tache) => {
        const tacheIndex = this.taches.findIndex(t => t.id === tache.id);
        if (tacheIndex !== -1) {
          this.taches[tacheIndex] = updatedTache;
        }
        this.showSuccessNotification('Tâche validée avec succès');
      },
      error: (error) => {
        console.error('❌ Erreur lors de la validation de la tâche:', error);
        this.showErrorNotification('Erreur lors de la validation de la tâche: ' + error.message);
      }
    });
  }

  /**
   * Refuse a task with reason
   */
  refuseTache(tacheId: number, reason: string): void {
    const tache = this.taches.find(t => t.id === tacheId);
    if (!tache) return;

    console.log('❌ Refus de la tâche:', tacheId, 'Raison:', reason);

    const validationRequest: ValidationRequest = {
      valide: false,
      motifRefus: reason,
      titre: tache.titre,
      dateFinale: tache.dateFinale,
      dureeEstimee: tache.dureeEstimee,
      dateLimite: tache.dateLimite
    };

    this.chefServiceService.validerTache(tacheId, validationRequest).subscribe({
      next: (updatedTache: Tache) => {
        const tacheIndex = this.taches.findIndex(t => t.id === tacheId);
        if (tacheIndex !== -1) {
          this.taches[tacheIndex] = updatedTache;
        }
        this.showSuccessNotification('Tâche refusée avec succès');
      },
      error: (error) => {
        console.error('❌ Erreur lors du refus de la tâche:', error);
        this.showErrorNotification('Erreur lors du refus de la tâche: ' + error.message);
      }
    });
  }

  /**
   * Afficher/masquer le formulaire d'ajout de tâche
   */
  toggleAddTaskForm(): void {
    this.showAddTaskForm = !this.showAddTaskForm;
    if (!this.showAddTaskForm) {
      this.resetNewTaskForm();
    }
    console.log('📋 Formulaire ajout tâche:', this.showAddTaskForm ? 'ouvert' : 'fermé');
  }

  /**
   * Réinitialiser le formulaire de nouvelle tâche
   */
  resetNewTaskForm(): void {
    this.newTask = {
      titre: '',
      description: '',
      dateFinale: '',
      dureeEstimee: '',
      dateLimite: ''
    };
  }

  /**
   * Vérifier si on peut ajouter une nouvelle tâche
   */
  canAddNewTask(): boolean {
    return this.newTask.titre && 
           this.newTask.titre.trim().length > 0 && 
           this.newTask.dateFinale && 
           this.newTask.dureeEstimee &&
           this.newTask.dureeEstimee.trim().length > 0;
  }

  /**
   * Ajouter une nouvelle tâche
   */
  addNewTask(): void {
    if (!this.selectedBesoin) {
      this.showErrorNotification('Aucun besoin sélectionné');
      return;
    }

    if (!this.canAddNewTask()) {
      this.showErrorNotification('Veuillez remplir tous les champs obligatoires (titre, date finale, durée estimée)');
      return;
    }

    console.log('➕ Ajout nouvelle tâche pour besoin:', this.selectedBesoin.id);

    this.chefServiceService.creerNouvelleTache(this.selectedBesoin.id, this.newTask).subscribe({
      next: (tache: Tache) => {
        // Ajouter la nouvelle tâche à la liste
        this.taches.push(tache);
        
        // Réinitialiser le formulaire
        this.resetNewTaskForm();
        this.showAddTaskForm = false;
        
        console.log('✅ Nouvelle tâche ajoutée avec succès:', tache.titre);
        this.showSuccessNotification('Tâche ajoutée avec succès');
      },
      error: (error) => {
        console.error('❌ Erreur lors de l\'ajout de la tâche:', error);
        this.showErrorNotification('Erreur lors de l\'ajout de la tâche: ' + error.message);
      }
    });
  }

  /**
   * Annuler l'ajout de tâche
   */
  cancelAddTask(): void {
    this.resetNewTaskForm();
    this.showAddTaskForm = false;
    console.log('❌ Ajout de tâche annulé');
  }

  /**
   * Get chef ID from authentication service or local storage
   */
  private getChefId(): number {
    // Essayer de récupérer depuis le localStorage
    const userData = localStorage.getItem('currentUser');
    
    if (userData) {
      try {
        const user = JSON.parse(userData);
        console.log('👤 Utilisateur connecté trouvé:', user);
        
        if (user.id && user.role === 'CHEF') {
          console.log('✅ ID chef trouvé:', user.id);
          return user.id;
        } else {
          console.warn('⚠️ Utilisateur n\'est pas un chef ou ID manquant:', user);
        }
      } catch (e) {
        console.error('❌ Erreur parsing user data:', e);
      }
    }
    
    // Fallback: utiliser l'ID 2 (chef.finances) pour les tests
    console.log('🔄 Utilisation de l\'ID par défaut: 2 (chef.finances)');
    return 2;
  }

  /**
   * Helper method to get employee name for display
   */
  getEmployeeName(besoin: Besoin): string {
    if (!besoin.employe) {
      return 'Employé inconnu';
    }
    return besoin.employe.username || 'Employé inconnu';
  }

  /**
   * Helper method to get employee service for display
   */
  getEmployeeService(besoin: Besoin): string {
    if (!besoin.employe) {
      return 'Service non spécifié';
    }
    return besoin.employe.service || 'Service non spécifié';
  }

  /**
   * Format status for display
   */
  getStatutDisplay(statut: string): string {
    const statutMap: { [key: string]: string } = {
      'EN_ATTENTE': 'EN ATTENTE',
      'ACCEPTE': 'ACCEPTÉ',
      'REFUSE': 'REFUSÉ'
    };
    return statutMap[statut] || statut;
  }

  /**
   * Format task status for display
   */
  getTacheStatutDisplay(statut: string): string {
    const statutMap: { [key: string]: string } = {
      'EN_ATTENTE': 'EN ATTENTE',
      'ACCEPTEE': 'ACCEPTÉE',
      'REFUSEE': 'REFUSÉE'
    };
    return statutMap[statut] || statut;
  }

  /**
   * Format date and time for display
   */
  formatDateTime(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if a task can be validated
   */
  canAcceptTache(tache: Tache): boolean {
    const hasValidTitre = typeof tache.titre === 'string' && tache.titre.trim().length > 0;
    const hasValidDateFinale = !!tache.dateFinale;
    const hasValidDuree = typeof tache.dureeEstimee === 'string' && tache.dureeEstimee.trim().length > 0;
    return hasValidTitre && hasValidDateFinale && hasValidDuree;
  }

  /**
   * Show success notification
   */
  private showSuccessNotification(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'success';
    this.showNotification = true;
    
    console.log('✅ Notification succès:', message);
    
    // Auto-hide after 5 seconds
    setTimeout(() => this.hideNotification(), 5000);
  }

  /**
   * Show error notification
   */
  private showErrorNotification(message: string): void {
    this.notificationMessage = message;
    this.notificationType = 'error';
    this.showNotification = true;
    
    console.error('❌ Notification erreur:', message);
    
    // Auto-hide after 5 seconds
    setTimeout(() => this.hideNotification(), 5000);
  }

  /**
   * Hide notification
   */
  hideNotification(): void {
    this.showNotification = false;
    console.log('🔕 Notification cachée');
  }

  /**
   * Get notification icon based on type
   */
  getNotificationIcon(): string {
    return this.notificationType === 'success' ? 'icon-check-circle' : 'icon-alert-circle';
  }

  /**
   * Refresh the besoins list
   */
  refreshBesoins(): void {
    console.log('🔄 Rafraîchissement de la liste des besoins');
    this.selectedBesoin = null;
    this.cpsContent = '';
    this.taches = [];
    this.signalements = [];
    this.showTasksSection = false;
    this.loadBesoins();
  }

  /**
   * Check if a besoin can be validated (is in EN_ATTENTE status)
   */
  canValidateBesoin(besoin: Besoin): boolean {
    return besoin.statut === 'EN_ATTENTE';
  }

  /**
   * Check if a task can be validated (is in EN_ATTENTE status)
   */
  canValidateTache(tache: Tache): boolean {
    return tache.statut === 'EN_ATTENTE';
  }

  /**
   * Get status badge class based on status
   */
  getStatusBadgeClass(statut: string): string {
    const baseClass = 'status-badge';
    
    switch (statut.toUpperCase()) {
      case 'EN_ATTENTE':
        return `${baseClass} status-en-attente`;
      case 'ACCEPTE':
      case 'ACCEPTEE':
        return `${baseClass} status-accepte`;
      case 'REFUSE':
      case 'REFUSEE':
        return `${baseClass} status-refuse`;
      default:
        return `${baseClass} status-default`;
    }
  }
}