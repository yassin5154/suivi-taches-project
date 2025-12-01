import { Component, OnInit, HostListener, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { AuthService, UserInfo } from '../../../core/services/auth.service';
import { Subscription } from 'rxjs';

interface MenuItem {
  label: string;
  icon: string;
  route: string;
  badge?: number;
  roles: string[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  animations: [
    trigger('slideIn', [
      transition(':enter', [
        style({ transform: 'translateX(0)', opacity: 1 }),
        animate('0ms', style({ transform: 'translateX(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('300ms ease-in', style({ transform: 'translateX(-100%)', opacity: 0 }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 1 }),
        animate('0ms', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class SidebarComponent implements OnInit, OnDestroy {
  @Output() toggleEvent = new EventEmitter<boolean>();
  @Output() closeEvent = new EventEmitter<void>();

  isCollapsed: boolean = false;
  isMobile: boolean = false;
  isOpen: boolean = true;
  appVersion: string = '1.0.0';

  userInfo: UserInfo = {
    username: '',
    role: 'EMPLOYE',
    name: 'Utilisateur',
    avatar: ''
  };

  private userSubscription!: Subscription;

  // Menu items avec contrôle des rôles
  private menuItems: MenuItem[] = [
    // Tableau de bord (tous les rôles)
    { 
      label: 'Tableau de bord', 
      icon: 'dashboard', 
      route: '/dashboard', 
      roles: ['ADMIN', 'CHEF', 'EMPLOYE'] 
    },
    
    // Admin uniquement
    { 
      label: 'Gestion des employés', 
      icon: 'people', 
      route: '/admin/employees', 
      roles: ['ADMIN'] 
    },
    { 
      label: 'Gestion des services', 
      icon: 'business', 
      route: '/admin/services', 
      roles: ['ADMIN'] 
    },
    { 
      label: 'Rapports', 
      icon: 'assessment', 
      route: '/admin/reports', 
      roles: ['ADMIN'] 
    },
    
    // Chef de Service
    { 
      label: 'Validation des tâches', 
      icon: 'check_circle', 
      route: '/chef-service/validation-taches', 
      roles: ['CHEF'] 
    },
    { 
      label: 'Suivi global', 
      icon: 'timeline', 
      route: '/chef-service/suivi-global', 
      roles: ['CHEF'] 
    },
    // Employé
    { 
      label: 'Créer un besoin (CPS)', 
      icon: 'add_circle', 
      route: '/employe/create-need', 
      roles: ['EMPLOYE'] 
    },
    { 
      label: 'Mes tâches', 
      icon: 'assignment', 
      route: '/employe/suivi-taches', 
      roles: ['EMPLOYE'] 
    },
    { 
      label: 'Suivi tâches', 
      icon: 'notifications', 
      route: '/employe/suivi', 
      roles: ['EMPLOYE'], 
    },
    
    // Commun à tous
    { 
      label: 'Profil', 
      icon: 'person', 
      route: '/profile', 
      roles: ['ADMIN', 'CHEF', 'EMPLOYE'] 
    },
    { 
      label: 'Paramètres', 
      icon: 'settings', 
      route: '/settings', 
      roles: ['ADMIN', 'CHEF', 'EMPLOYE'] 
    }
  ];

  currentMenuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.updateMenuItems();
    this.checkMobileView();
    
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userInfo = { 
          ...user, 
          avatar: user.avatar || this.generateDefaultAvatar(user) 
        };
        this.updateMenuItems();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkMobileView();
  }

  private checkMobileView(): void {
    this.isMobile = window.innerWidth <= 768;
    if (this.isMobile) {
      this.isOpen = false;
    } else {
      this.isOpen = true;
      this.isCollapsed = false;
    }
  }

  private loadUserInfo(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userInfo = { 
        ...currentUser, 
        avatar: currentUser.avatar || this.generateDefaultAvatar(currentUser) 
      };
    }
  }

  private generateDefaultAvatar(user: any): string {
    const colors: { [key: string]: string } = {
      'ADMIN': '#FF6B6B',
      'CHEF': '#4ECDC4', 
      'EMPLOYE': '#45B7D1'
    };
    
    const color = colors[user.role] || '#95A5A6';
    const initials = this.getUserInitialsFromName(user.name);
    
    return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='${encodeURIComponent(color)}' rx='32'/%3E%3Ctext x='32' y='38' font-family='Arial' font-size='24' fill='white' text-anchor='middle'%3E${initials}%3C/text%3E%3C/svg%3E`;
  }

  private getUserInitialsFromName(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  }

  private updateMenuItems(): void {
    const userRole = this.userInfo.role;
    this.currentMenuItems = this.menuItems.filter(item => 
      item.roles.includes(userRole)
    );
  }

  toggleSidebar(): void {
    if (this.isMobile) {
      this.isOpen = !this.isOpen;
      this.closeEvent.emit();
    } else {
      this.isCollapsed = !this.isCollapsed;
      this.toggleEvent.emit(this.isCollapsed);
    }
  }

  closeSidebar(): void {
    if (this.isMobile) {
      this.isOpen = false;
      this.closeEvent.emit();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  getUserInitials(): string {
    return this.getUserInitialsFromName(this.userInfo.name);
  }
}