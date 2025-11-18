import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthResponse, AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]], // Changé de 'email' à 'username'
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
  this.submitted = true;
  this.errorMessage = '';

  if (this.loginForm.invalid) {
    return;
  }

  this.isLoading = true;

  const loginData = {
    username: this.loginForm.value.username,
    password: this.loginForm.value.password
  };

  this.authService.login(loginData).subscribe({
    next: (response: AuthResponse) => {
      this.isLoading = false;
      
      // Token and user info are already saved in the service
      // Redirection basée sur le rôle
      this.redirectBasedOnRole(response.role);
    },
    error: (error) => {
      this.isLoading = false;
      this.errorMessage = error.error?.message || 'Erreur de connexion';
      console.error('Login error:', error);
      
      // More detailed error logging
      if (error.status === 403) {
        this.errorMessage = 'Accès refusé. Vérifiez vos identifiants.';
      } else if (error.status === 0) {
        this.errorMessage = 'Impossible de se connecter au serveur. Vérifiez que le serveur est démarré.';
      }
    }
  });
}

  private redirectBasedOnRole(role: string): void {
  this.router.navigate(['/dashboard']);
}


  loginWithGoogle(): void {
    console.log('Login with Google');
    // À implémenter
  }

  loginWithLinkedIn(): void {
    console.log('Login with LinkedIn');
    // À implémenter
  }
}