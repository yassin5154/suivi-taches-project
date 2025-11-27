import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EmployeService } from '../../../../core/services/employe.service';
import { AuthService, UserInfo } from '../../../../core/services/auth.service';
import { SignalementService, Signalement, SignalementRequest } from '../../../../core/services/signalement.service';

// Interface pour la réponse de l'API
interface BesoinApi {
  id: number;
  titre: string;
  description: string;
  fichierCPS?: string;
  dateCreation: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
  motifRefus?: string;
  validationDate?: string;
  employe?: {
    id: number;
    nom: string;
    prenom: string;
    service: string;
    poste: string;
  };
  taches?: Tache[];
}

// Interface pour l'affichage dans le composant
interface Besoin {
  id: number;
  titre: string;
  description: string;
  employe: string;
  service: string;
  dateCreation: string;
  statut: 'EN_ATTENTE' | 'ACCEPTE' | 'REFUSE';
  dateValidation?: string;
  motifRefus?: string;
  isOwner: boolean;
  fichierCPS?: string;
  taches?: Tache[];
  validationDate?: string;
  employeId?: number;
}


// Interface pour l'affichage dans le composant
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

@Component({
  selector: 'app-suivi-taches',
  templateUrl: './suivi-taches.component.html',
  styleUrls: ['./suivi-taches.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class SuiviTachesComponent implements OnInit {
  besoins: Besoin[] = [];
  selectedBesoin: Besoin | null = null;
  cpsContent: string = '';
  taches: Tache[] = [];
  isOwner: boolean = false;
  showEditButton: boolean = false;
  showSignalSection: boolean = false;
  reasonSignal: string = '';
  showSignalModal: boolean = false;
  selectedTask: Tache | null = null;
  fadeIn: boolean = false;
  currentUserId: number | null = null;
  currentUser: UserInfo | null = null;
  isLoading: boolean = true;
  showEditModal: boolean = false;
  isSubmitting: boolean = false;
  newCpsFile: File | null = null;
  filePreviewContent: string = '';
  isDragOver: boolean = false;
  signalements: Signalement[] = [];
  showCpsSignalModal: boolean = false;
  selectedTacheNumero: string = '';
  signalMessage: string = '';

  editBesoinData = {
    titre: '',
    description: '',
    fichierCPS: ''
  };

  constructor(
    private employeService: EmployeService,
    private authService: AuthService,
    private signalementService: SignalementService
  ) {}

  ngOnInit(): void {
    this.loadCurrentUser();
  }

  loadCurrentUser(): void {
    this.currentUserId = this.authService.getCurrentUserId();
    this.currentUser = this.authService.getCurrentUser();
    
    console.log('User ID:', this.currentUserId);
    console.log('Current User:', this.currentUser);

    if (this.currentUserId) {
      this.loadBesoinsService();
    } else {
      console.error('Aucun utilisateur connecté trouvé');
      this.isLoading = false;
    }

    setTimeout(() => {
      this.fadeIn = true;
    }, 100);
  }

  loadBesoinsService(): void {
    if (!this.currentUserId) {
      console.error('Impossible de charger les besoins: ID utilisateur manquant');
      this.isLoading = false;
      return;
    }

    this.isLoading = true;
    this.employeService.getBesoinsService(this.currentUserId).subscribe({
      next: (result: any) => {
        console.log('Besoins chargés:', result);

        if (!Array.isArray(result)) {
          // Si la réponse n'est pas un tableau, on vide la liste
          this.besoins = [];
        } else if (result.length > 0 && result[0] && typeof result[0].employe === 'object') {
          // Si la réponse contient des objets BesoinApi (employe est un objet), on transforme
          this.besoins = result.map((besoinApi: BesoinApi) => this.transformBesoinApiToBesoin(besoinApi));
        } else {
          // Sinon on considère que la réponse est déjà au format Besoin[]
          this.besoins = result as Besoin[];
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement besoins:', error);
        alert('Erreur lors du chargement des besoins du service');
        this.isLoading = false;
      }
    });
  }

  // Méthode pour transformer la réponse API en format d'affichage
  private transformBesoinApiToBesoin(besoinApi: BesoinApi): Besoin {
    const employeId = besoinApi.employe?.id;
    const employeNomComplet = besoinApi.employe ? 
      `${besoinApi.employe.prenom} ${besoinApi.employe.nom}` : 
      'Employé inconnu';
    
    const service = besoinApi.employe?.service || 'Service inconnu';

    return {
      id: besoinApi.id,
      titre: besoinApi.titre,
      description: besoinApi.description,
      employe: employeNomComplet,
      service: service,
      dateCreation: besoinApi.dateCreation,
      statut: besoinApi.statut,
      dateValidation: besoinApi.validationDate,
      motifRefus: besoinApi.motifRefus,
      isOwner: employeId === this.currentUserId,
      fichierCPS: besoinApi.fichierCPS,
      taches: besoinApi.taches,
      employeId: employeId
    };
  }

  getEmployeName(employeId?: number): string {
    // Si c'est l'utilisateur courant, utiliser les infos du authService
    if (employeId === this.currentUserId && this.currentUser) {
      return this.currentUser.name || 'Vous';
    }

    const employes: {[key: number]: string} = {
      4: 'Amina Zouhair',
      5: 'Youssef Mansouri', 
      6: 'Leila Rachidi'
    };
    return employes[employeId || 0] || 'Employé inconnu';
  }

  openBesoin(besoin: Besoin): void {
  this.selectedBesoin = besoin;
  this.isOwner = besoin.isOwner;
  
  // Charger le contenu CPS
  this.loadCpsContent(besoin.id);
  
  // TOUJOURS charger les tâches depuis l'API, peu importe qui est le propriétaire
  this.loadTachesForBesoin(besoin.id);

  // Charger les signalements existants pour ce besoin
  this.loadSignalements(besoin.id);
  
  this.showEditButton = this.canEditBesoin();
  this.showSignalSection = this.canSignalTasks();
}

loadSignalements(besoinId: number): void {
    this.signalementService.getSignalementsParBesoin(besoinId).subscribe({
      next: (signalements) => {
        this.signalements = signalements;
      },
      error: (error) => {
        console.error('Erreur chargement signalements:', error);
        this.signalements = [];
      }
    });
  }

  openCpsSignalModal(): void {
    this.selectedTacheNumero = '';
    this.signalMessage = '';
    this.showCpsSignalModal = true;
  }

  closeCpsSignalModal(): void {
    this.showCpsSignalModal = false;
    this.selectedTacheNumero = '';
    this.signalMessage = '';
  }

  submitCpsSignal(): void {
    if (!this.selectedBesoin || !this.currentUserId || !this.selectedTacheNumero || !this.signalMessage.trim()) {
      return;
    }

    const signalementRequest: SignalementRequest = {
      numeroTache: this.selectedTacheNumero,
      message: this.signalMessage
    };

    this.signalementService.creerSignalement(
      this.currentUserId,
      this.selectedBesoin.id,
      signalementRequest
    ).subscribe({
      next: (signalement) => {
        // Ajouter le nouveau signalement à la liste
        this.signalements.unshift(signalement);
        this.closeCpsSignalModal();
        alert('Votre signalement a été envoyé au chef de service');
      },
      error: (error) => {
        console.error('Erreur envoi signalement:', error);
        alert('Erreur lors de l\'envoi du signalement');
      }
    });
  }

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

loadTachesForBesoin(besoinId: number): void {
  console.log('Chargement des tâches pour le besoin:', besoinId);
  
  // Appeler l'API pour charger les tâches
  this.employeService.getTachesByBesoinId(besoinId).subscribe({
    next: (taches) => {
      console.log('Tâches chargées:', taches);
      this.taches = taches;
      
      // Mettre à jour aussi le besoin sélectionné avec les tâches
      if (this.selectedBesoin) {
        this.selectedBesoin.taches = taches;
      }
    },
    error: (error) => {
      console.error('Erreur chargement tâches:', error);
      this.taches = [];
      // En cas d'erreur, essayer d'utiliser les tâches existantes si disponibles
      if (this.selectedBesoin?.taches && this.selectedBesoin.taches.length > 0) {
        this.taches = this.selectedBesoin.taches;
      }
    }
  });
}

  loadCpsContent(besoinId: number): void {
    this.employeService.getCpsContent(besoinId).subscribe({
      next: (content) => {
        this.cpsContent = content;
        // Si le besoin est en attente et qu'on peut signaler, parser les tâches du CPS
        if (this.showSignalSection) {
          this.taches = this.parseCpsTasks(content);
        }
      },
      error: (error) => {
        console.error('Erreur chargement CPS:', error);
        this.cpsContent = 'Impossible de charger le fichier CPS';
      }
    });
  }

  closeBesoin(): void {
    this.selectedBesoin = null;
    this.reasonSignal = '';
    this.showSignalModal = false;
  }

  canEditBesoin(): boolean {
    return this.selectedBesoin?.isOwner === true && 
           this.selectedBesoin?.statut === 'EN_ATTENTE';
  }

  canSignalTasks(): boolean {
  return this.selectedBesoin?.isOwner === false && 
         this.selectedBesoin?.statut === 'EN_ATTENTE';
}

  parseCpsTasks(cpsContent: string): Tache[] {
    const tasks: Tache[] = [];
    const lines = cpsContent.split('\n');
    let currentTask: Partial<Tache> = {};
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      if (trimmedLine.match(/^Tâche\s+\d+/i) || trimmedLine.match(/^TACHE_/i)) {
        // Sauvegarder la tâche précédente
        if (currentTask.titre) {
          tasks.push(currentTask as Tache);
        }
        currentTask = { titre: trimmedLine };
      } else if (trimmedLine.startsWith('Titre :')) {
        currentTask.titre = trimmedLine.replace('Titre :', '').trim();
      } else if (trimmedLine.startsWith('Description :')) {
        currentTask.description = trimmedLine.replace('Description :', '').trim();
      } else if (trimmedLine.startsWith('Durée :') || trimmedLine.startsWith('DUREE:')) {
        currentTask.duree = trimmedLine.replace(/Durée\s*:|DUREE:/, '').trim();
      }
    });
    
    // Ajouter la dernière tâche
    if (currentTask.titre) {
      tasks.push(currentTask as Tache);
    }
    
    return tasks.map((task, index) => ({
      id: index + 1,
      titre: task.titre || 'Tâche sans titre',
      description: task.description || '',
      duree: task.duree
    }));
  }

  modifierBesoin(): void {
    if (!this.selectedBesoin) return;
    // Initialiser les données du formulaire
    this.editBesoinData = {
      titre: this.selectedBesoin.titre,
      description: this.selectedBesoin.description,
      fichierCPS: this.selectedBesoin.fichierCPS || ''
    };
    
    this.newCpsFile = null;
    this.filePreviewContent = '';
    this.showEditModal = true;
  }

  closeEditModal(): void {
    this.showEditModal = false;
    this.newCpsFile = null;
    this.filePreviewContent = '';
    this.isSubmitting = false;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    this.handleFileSelection(file);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFileSelection(files[0]);
    }
  }

  private handleFileSelection(file: File): void {
    // Vérifier le type de fichier
    if (file.type !== 'text/plain' && !file.name.toLowerCase().endsWith('.txt')) {
      alert('Veuillez sélectionner un fichier texte (.txt)');
      return;
    }

    // Vérifier la taille du fichier (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux. Taille maximale : 5MB');
      return;
    }

    this.newCpsFile = file;
    this.previewFileContent(file);
  }

  private previewFileContent(file: File): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.filePreviewContent = e.target.result.substring(0, 1000); // Limiter l'aperçu
      if (file.size > 1000) {
        this.filePreviewContent += '\n... (contenu tronqué)';
      }
    };
    reader.readAsText(file);
  }

  removeFile(): void {
    this.newCpsFile = null;
    this.filePreviewContent = '';
  }

  getFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  }

  async submitModification(): Promise<void> {
    if (!this.selectedBesoin || !this.currentUserId) return;

    this.isSubmitting = true;

    try {
      let fichierCPSPath = this.selectedBesoin.fichierCPS;

      // Upload du nouveau fichier s'il y en a un
      if (this.newCpsFile) {
        const formData = new FormData();
        formData.append('file', this.newCpsFile);
        
        try {
          const filePath = await this.employeService.uploadFile(formData).toPromise();
          fichierCPSPath = filePath;
        } catch (error) {
          console.error('Erreur upload fichier:', error);
          alert('Erreur lors de l\'upload du fichier');
          this.isSubmitting = false;
          return;
        }
      }

      // Préparer les données de modification
      const modifiedData = {
        titre: this.editBesoinData.titre,
        description: this.editBesoinData.description,
        fichierCPS: fichierCPSPath
      };

      // Appeler l'API de modification
      this.employeService.modifierBesoin(
        this.currentUserId,
        this.selectedBesoin.id,
        modifiedData
      ).subscribe({
        next: (besoinModifie) => {
          console.log('Besoin modifié:', besoinModifie);
          alert('Besoin modifié avec succès !');
          this.closeEditModal();
          this.closeBesoin();
          // Recharger la liste des besoins
          this.loadBesoinsService();
        },
        error: (error) => {
          console.error('Erreur modification:', error);
          alert('Erreur lors de la modification du besoin');
          this.isSubmitting = false;
        }
      });

    } catch (error) {
      console.error('Erreur:', error);
      this.isSubmitting = false;
    }
  }
  getStatutBadgeClass(statut: string): string {
    const classes: {[key: string]: string} = {
      'EN_ATTENTE': 'badge-waiting',
      'ACCEPTE': 'badge-accepted',
      'REFUSE': 'badge-refused'
    };
    return classes[statut] || 'badge-default';
  }

  getStatutText(statut: string): string {
    const texts: {[key: string]: string} = {
      'EN_ATTENTE': 'En Attente',
      'ACCEPTE': 'Accepté',
      'REFUSE': 'Refusé'
    };
    return texts[statut] || statut;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  }
}