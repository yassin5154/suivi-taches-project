import { Component, OnInit, OnDestroy, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { HeaderComponent } from '../shared/components/header/header.component';
import { SidebarComponent } from '../shared/components/sidebar/sidebar.component';
import { FooterComponent } from '../shared/components/footer/footer.component';
import { AuthService } from '../core/services/auth.service';

interface PageConfig {
  title: string;
  showHeader: boolean;
  showSidebar: boolean;
  showFooter: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    HeaderComponent, 
    SidebarComponent, 
    FooterComponent
  ],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export class LayoutComponent implements OnInit, OnDestroy {
  currentPageTitle: string = 'Tableau de bord';
  isSidebarCollapsed: boolean = false;
  isMobileView: boolean = false;
  isSidebarOpen: boolean = true;

  private routerSubscription!: Subscription;
  private userSubscription!: Subscription;

  // Page configurations
  private pageConfigs: { [key: string]: PageConfig } = {
    '/dashboard': {
      title: 'Tableau de bord',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/admin/employees': {
      title: 'Gestion des employés',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/admin/services': {
      title: 'Gestion des services',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/admin/reports': {
      title: 'Rapports',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/employe/create-need': {
      title: 'Créer un besoin (CPS)',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/employe/tasks': {
      title: 'Mes tâches',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/employe/notifications': {
      title: 'Notifications',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/chef/validation': {
      title: 'Validation des tâches',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/chef/tracking': {
      title: 'Suivi global',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/chef/statistics': {
      title: 'Statistiques',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/help': {
      title: 'Aide / Contact',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/profile': {
      title: 'Mon Profil',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/settings': {
      title: 'Paramètres',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    },
    '/change-password': {
      title: 'Changer le mot de passe',
      showHeader: true,
      showSidebar: true,
      showFooter: true
    }
  };

  currentPageConfig: PageConfig = {
    title: 'Tableau de bord',
    showHeader: true,
    showSidebar: true,
    showFooter: true
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.checkScreenSize();

    // Listen to route changes
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updatePageConfig(event.urlAfterRedirects);
        // Force change detection after route change
        setTimeout(() => {
          this.cdr.detectChanges();
        }, 0);
      });

    // Set initial page config
    this.updatePageConfig(this.router.url);

    // Listen to user changes
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        // User info updated, menu items will update automatically in sidebar
        this.cdr.detectChanges();
      }
    });

    // Force initial change detection
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy(): void {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    this.isMobileView = window.innerWidth <= 768;
    
    if (this.isMobileView) {
      this.isSidebarOpen = false;
    } else {
      this.isSidebarOpen = true;
    }
  }

  private updatePageConfig(url: string): void {
    const config = this.pageConfigs[url];
    
    if (config) {
      this.currentPageConfig = config;
      this.currentPageTitle = config.title;
    } else {
      // Default config
      this.currentPageConfig = {
        title: 'Page',
        showHeader: true,
        showSidebar: true,
        showFooter: true
      };
      this.currentPageTitle = this.extractTitleFromUrl(url);
    }
  }

  private extractTitleFromUrl(url: string): string {
    const segments = url.split('/').filter(s => s);
    if (segments.length > 0) {
      return segments[segments.length - 1]
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    return 'Tableau de bord';
  }

  onSidebarToggle(isCollapsed: boolean): void {
    this.isSidebarCollapsed = isCollapsed;
  }

  onSidebarClose(): void {
    this.isSidebarOpen = false;
  }

  get mainContainerClass(): string {
    const classes = ['main-container'];
    
    if (this.isSidebarCollapsed && !this.isMobileView) {
      classes.push('sidebar-collapsed');
    }
    
    if (this.isMobileView) {
      classes.push('mobile-view');
    }
    
    return classes.join(' ');
  }
}