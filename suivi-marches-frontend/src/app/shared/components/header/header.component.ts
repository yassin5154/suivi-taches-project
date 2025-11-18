import { Component, Input, OnInit, OnDestroy, Inject, PLATFORM_ID, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, UserInfo } from '../../../core/services/auth.service';
import { trigger, transition, style, animate } from '@angular/animations';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  animations: [
    // Keep only the dropdown animation as it's functional
    trigger('dropdownAnimation', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-10px) scale(0.95)' }))
      ])
    ])
  ]
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() pageTitle: string = 'Dashboard';
  
  userInfo: UserInfo = {
    username: '',
    role: 'EMPLOYE',
    name: 'Utilisateur',
    avatar: ''
  };
  
  notificationCount: number = 3;
  isDropdownOpen: boolean = false;
  isMobileMenuOpen: boolean = false;
  isDarkMode: boolean = false;
  isScrolled: boolean = false;

  private userSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    
    if (isPlatformBrowser(this.platformId)) {
      window.addEventListener('scroll', this.onScroll.bind(this));
    }

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userInfo = user;
      }
    });
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.onScroll.bind(this));
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.user-profile') && !target.closest('.dropdown-menu')) {
      this.closeDropdown();
    }
  }

  private onScroll(): void {
    this.isScrolled = window.scrollY > 10;
  }

  private loadUserInfo(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userInfo = currentUser;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('dark-mode');
    }
  }

  onNotificationClick(): void {
    this.router.navigate(['/employe/notifications']);
    this.isMobileMenuOpen = false;
  }

  onProfileClick(): void {
    this.toggleDropdown();
  }

  goToProfile(): void {
    this.router.navigate(['/profile']);
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }

  changePassword(): void {
    this.router.navigate(['/change-password']);
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
    this.isDropdownOpen = false;
    this.isMobileMenuOpen = false;
  }

  closeDropdown(): void {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
    if (this.isMobileMenuOpen) {
      this.isMobileMenuOpen = false;
    }
  }

  getUserInitials(): string {
    return this.userInfo.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  getRoleDisplay(): string {
    return this.authService.getRoleDisplayName(this.userInfo.role);
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}