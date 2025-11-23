import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { EmployeService } from '../../../../core/services/employe.service';
import { AuthService } from '../../../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-need',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-need.component.html',
  styleUrls: ['./create-need.component.css']
})
export class CreateNeedComponent implements OnInit {
  createNeedForm!: FormGroup;
  selectedFile: File | null = null;
  selectedFileName: string = '';
  fileError: string = '';
  isLoading: boolean = false;
  showSuccess: boolean = false;
  showError: boolean = false;
  errorMessage: string = '';
  currentDate: string = '';
  employeId: number | null = null;

  constructor(
    private employeService: EmployeService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initializeForm();
    this.setCurrentDate();
    this.getEmployeId();
  }

  private initializeForm(): void {
    this.createNeedForm = new FormGroup({
      titre: new FormControl('', [
        Validators.required,
        Validators.minLength(3)
      ]),
      description: new FormControl('', [
        Validators.required,
        Validators.minLength(10)
      ]),
      fichierCPS: new FormControl('', [
        Validators.required
      ])
    });
  }

  private setCurrentDate(): void {
    const today = new Date();
    this.currentDate = today.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  private getEmployeId(): void {
  this.employeId = this.authService.getCurrentUserId();
  
  console.log('Raw employee ID:', this.employeId);
  console.log('Type of employee ID:', typeof this.employeId);
  
  if (!this.employeId) {
    console.error('Could not retrieve employee ID');
    this.showError = true;
    this.errorMessage = 'Impossible de récupérer votre identifiant. Veuillez vous reconnecter.';
    return;
  }
  
  // Convertir en nombre si c'est une chaîne numérique
  if (typeof this.employeId === 'string') {
    const parsedId = Number(this.employeId);
    if (!isNaN(parsedId)) {
      this.employeId = parsedId;
      console.log('Converted employee ID to number:', this.employeId);
    } else {
      console.error('Employee ID is not a valid number:', this.employeId);
      this.showError = true;
      this.errorMessage = 'Identifiant employé invalide. Veuillez vous reconnecter.';
      this.employeId = null;
      return;
    }
  }
  
  // Vérifier que c'est bien un nombre
  if (typeof this.employeId !== 'number' || isNaN(this.employeId)) {
    console.error('Invalid employee ID type or value:', this.employeId);
    this.showError = true;
    this.errorMessage = 'Identifiant employé invalide. Veuillez vous reconnecter.';
    this.employeId = null;
    return;
  }
  
  console.log('Final employee ID:', this.employeId, 'Type:', typeof this.employeId);
}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.name.endsWith('.txt')) {
        this.fileError = 'Seuls les fichiers .txt sont acceptés';
        this.selectedFile = null;
        this.selectedFileName = '';
        this.createNeedForm.patchValue({ fichierCPS: '' });
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        this.fileError = 'Le fichier ne doit pas dépasser 5 MB';
        this.selectedFile = null;
        this.selectedFileName = '';
        this.createNeedForm.patchValue({ fichierCPS: '' });
        return;
      }

      this.fileError = '';
      this.selectedFile = file;
      this.selectedFileName = file.name;
      this.createNeedForm.patchValue({ fichierCPS: file.name });
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.createNeedForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    // Vérifiez que nous avons un ID employé valide (NUMBER)
    if (!this.employeId || typeof this.employeId !== 'number') {
      this.showError = true;
      this.errorMessage = 'Identifiant employé invalide. Veuillez vous reconnecter.';
      console.error('Invalid employee ID:', this.employeId);
      return;
    }

    Object.keys(this.createNeedForm.controls).forEach(key => {
      this.createNeedForm.get(key)?.markAsTouched();
    });

    if (!this.selectedFile) {
      this.fileError = 'Le fichier CPS est obligatoire';
      return;
    }

    if (this.createNeedForm.invalid) {
      return;
    }

    this.isLoading = true;
    this.showSuccess = false;
    this.showError = false;
    this.errorMessage = '';

    // SOLUTION SIMPLIFIÉE : Créer le besoin directement sans upload de fichier
    this.createBesoinDirectly();
  }

  /**
   * SOLUTION SIMPLIFIÉE - Créer le besoin sans upload de fichier
   */
  private createBesoinDirectly(): void {
    if (!this.employeId) return;

    // Utilisez juste le nom du fichier original
    const besoinData = {
      titre: this.createNeedForm.get('titre')?.value,
      description: this.createNeedForm.get('description')?.value,
      fichierCPS: this.selectedFileName // Juste le nom du fichier
    };

    console.log('Creating besoin with data:', besoinData);
    console.log('Employee ID being sent:', this.employeId);
    console.log('Type of employee ID:', typeof this.employeId);

    this.employeService.createBesoin(this.employeId, besoinData).subscribe({
      next: (besoin) => {
        this.isLoading = false;
        this.showSuccess = true;
        this.resetForm();
        setTimeout(() => { this.showSuccess = false; }, 5000);
      },
      error: (error) => {
        this.handleError(error);
      }
    });
  }

  private handleError(error: any): void {
    this.isLoading = false;
    this.showError = true;
    
    if (error.error instanceof ErrorEvent) {
      this.errorMessage = `Erreur: ${error.error.message}`;
    } else {
      this.errorMessage = error.error?.message || error.message || 'Une erreur est survenue. Veuillez réessayer.';
    }
    
    console.error('Error details:', error);
    setTimeout(() => { this.showError = false; }, 5000);
  }

  private resetForm(): void {
    this.createNeedForm.reset();
    this.selectedFile = null;
    this.selectedFileName = '';
    this.fileError = '';
    
    Object.keys(this.createNeedForm.controls).forEach(key => {
      this.createNeedForm.get(key)?.setErrors(null);
      this.createNeedForm.get(key)?.markAsUntouched();
      this.createNeedForm.get(key)?.markAsPristine();
    });
  }
}