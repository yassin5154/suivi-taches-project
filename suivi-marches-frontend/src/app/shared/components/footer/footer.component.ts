import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent implements OnInit, OnDestroy {
  currentYear: number = new Date().getFullYear();
  appVersion: string = '1.0.0';
  isMobileLinksExpanded: boolean = false;

  quickLinks = [
    {
      label: 'Mentions légales',
      route: '/legal',
      external: false
    },
    {
      label: 'Politique de confidentialité',
      route: '/privacy',
      external: false
    },
    {
      label: 'Contact',
      route: '/contact',
      external: false
    }
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.checkMobileView();
    window.addEventListener('resize', this.checkMobileView.bind(this));
    
    // Force change detection after initialization
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.checkMobileView.bind(this));
  }

  private checkMobileView(): void {
    // Auto-collapse mobile links on desktop
    if (window.innerWidth > 768) {
      this.isMobileLinksExpanded = false;
    }
  }

  toggleMobileLinks(): void {
    this.isMobileLinksExpanded = !this.isMobileLinksExpanded;
  }

  onLinkClick(link: any): void {
    if (link.external) {
      window.open(link.route, '_blank');
    }
    // For internal routes, Angular Router will handle navigation
    this.isMobileLinksExpanded = false;
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}