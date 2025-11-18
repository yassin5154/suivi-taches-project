import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService, UserInfo } from '../../core/services/auth.service';
import { Subscription } from 'rxjs';

interface SummaryCard {
  title: string;
  value: number | string;
  icon: string;
  trend?: string;
  trendUp?: boolean;
  color: string;
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
}

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface TaskItem {
  employee?: string;
  task: string;
  status: string;
  date: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  userInfo: UserInfo = {
    username: '',
    role: 'EMPLOYE',
    name: 'Utilisateur',
    avatar: ''
  };

  greeting: string = '';
  subtitle: string = '';
  summaryCards: SummaryCard[] = [];
  quickActions: QuickAction[] = [];
  chartData: ChartData[] = [];
  taskList: TaskItem[] = [];
  progressValue: number = 0;

  private userSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.setGreeting();
    this.loadDashboardData();
    
    // Force change detection after initial load
    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);

    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.userInfo = user;
        this.setGreeting();
        this.loadDashboardData();
        this.cdr.detectChanges();
      }
    });
  }

  ngOnDestroy(): void {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  private loadUserInfo(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userInfo = currentUser;
    }
  }

  private setGreeting(): void {
    const hour = new Date().getHours();
    let greetingPrefix = 'Bonjour';
    
    if (hour < 12) {
      greetingPrefix = 'Bonjour';
    } else if (hour < 18) {
      greetingPrefix = 'Bon après-midi';
    } else {
      greetingPrefix = 'Bonsoir';
    }

    this.greeting = `${greetingPrefix} ${this.userInfo.name} 👋`;

    // Set subtitle based on role
    switch (this.userInfo.role) {
      case 'ADMIN':
        this.subtitle = 'Vue globale du système et performances';
        break;
      case 'CHEF':
        this.subtitle = 'Suivi des activités et validations';
        break;
      case 'EMPLOYE':
        this.subtitle = 'Suivi de vos tâches et notifications';
        break;
      default:
        this.subtitle = 'Voici votre tableau de bord';
    }
  }

  private loadDashboardData(): void {
    switch (this.userInfo.role) {
      case 'ADMIN':
        this.loadAdminData();
        break;
      case 'CHEF':
        this.loadChefData();
        break;
      case 'EMPLOYE':
        this.loadEmployeData();
        break;
    }
  }

  private loadAdminData(): void {
    this.summaryCards = [
      {
        title: 'Total Employés',
        value: 48,
        icon: 'people',
        trend: '+12%',
        trendUp: true,
        color: '#42A5F5'
      },
      {
        title: 'Marchés en cours',
        value: 23,
        icon: 'assessment',
        trend: '+5',
        trendUp: true,
        color: '#66BB6A'
      },
      {
        title: 'Tâches terminées',
        value: 156,
        icon: 'check_circle',
        trend: '+18%',
        trendUp: true,
        color: '#26A69A'
      },
      {
        title: 'Demandes en attente',
        value: 12,
        icon: 'schedule',
        trend: '-3',
        trendUp: false,
        color: '#FFA726'
      }
    ];

    this.quickActions = [
      { label: 'Gérer utilisateurs', icon: 'people', route: '/admin/employees' },
      { label: 'Voir rapports', icon: 'assessment', route: '/admin/reports' },
      { label: 'Gérer services', icon: 'business', route: '/admin/services' }
    ];

    this.chartData = [
      { label: 'Service Achats', value: 45, color: '#42A5F5' },
      { label: 'Service Comptabilité', value: 32, color: '#66BB6A' },
      { label: 'Service RH', value: 28, color: '#FFA726' },
      { label: 'Service IT', value: 51, color: '#AB47BC' }
    ];

    this.taskList = [
      { employee: 'Ahmed Ben Ali', task: 'Validation CPS #2024-001', status: 'En cours', date: '10/11/2024' },
      { employee: 'Fatima Zahra', task: 'Appel d\'offres IT', status: 'Terminé', date: '09/11/2024' },
      { employee: 'Mohamed Idrissi', task: 'Audit financier Q4', status: 'En attente', date: '08/11/2024' },
      { employee: 'Samira Bennis', task: 'Recrutement développeur', status: 'En cours', date: '07/11/2024' }
    ];
  }

  private loadChefData(): void {
    this.summaryCards = [
      {
        title: 'Tâches à valider',
        value: 8,
        icon: 'assignment_turned_in',
        trend: '+2',
        trendUp: true,
        color: '#FFA726'
      },
      {
        title: 'Employés actifs',
        value: 12,
        icon: 'people',
        trend: '100%',
        trendUp: true,
        color: '#42A5F5'
      },
      {
        title: 'Tâches validées',
        value: 34,
        icon: 'check_circle',
        trend: '+15%',
        trendUp: true,
        color: '#66BB6A'
      },
      {
        title: 'Retards',
        value: 3,
        icon: 'warning',
        trend: '-1',
        trendUp: false,
        color: '#EF5350'
      }
    ];

    this.quickActions = [
      { label: 'Voir toutes les tâches', icon: 'assignment', route: '/chef/tracking' },
      { label: 'Consulter statistiques', icon: 'bar_chart', route: '/chef/statistics' },
      { label: 'Valider les tâches', icon: 'check_circle', route: '/chef/validation' }
    ];

    this.chartData = [
      { label: 'Lundi', value: 8 },
      { label: 'Mardi', value: 12 },
      { label: 'Mercredi', value: 10 },
      { label: 'Jeudi', value: 15 },
      { label: 'Vendredi', value: 9 }
    ];

    this.taskList = [
      { employee: 'Ahmed Ben Ali', task: 'Préparation CPS marché public', status: 'À valider', date: '11/11/2024' },
      { employee: 'Fatima Zahra', task: 'Analyse des offres reçues', status: 'À valider', date: '11/11/2024' },
      { employee: 'Mohamed Idrissi', task: 'Rapport de conformité', status: 'Validé', date: '10/11/2024' },
      { employee: 'Samira Bennis', task: 'Dossier technique', status: 'À valider', date: '09/11/2024' }
    ];
  }

  private loadEmployeData(): void {
    this.summaryCards = [
      {
        title: 'Mes Tâches en cours',
        value: 5,
        icon: 'assignment',
        trend: '+1',
        trendUp: true,
        color: '#42A5F5'
      },
      {
        title: 'Tâches terminées',
        value: 18,
        icon: 'check_circle',
        trend: '+3',
        trendUp: true,
        color: '#66BB6A'
      },
      {
        title: 'Notifications',
        value: 3,
        icon: 'notifications',
        color: '#FFA726'
      }
    ];

    this.quickActions = [
      { label: 'Créer une demande (CPS)', icon: 'add_circle', route: '/employe/create-need' },
      { label: 'Voir mes tâches', icon: 'assignment', route: '/employe/tasks' },
      { label: 'Notifications', icon: 'notifications', route: '/employe/notifications' }
    ];

    this.progressValue = 72;

    this.taskList = [
      { task: 'Rédaction CPS marché fournitures', status: 'En cours', date: '11/11/2024' },
      { task: 'Consultation des fournisseurs', status: 'En cours', date: '10/11/2024' },
      { task: 'Analyse comparative des prix', status: 'Terminé', date: '09/11/2024' },
      { task: 'Préparation dossier technique', status: 'En cours', date: '08/11/2024' },
      { task: 'Validation chef de service', status: 'En attente', date: '07/11/2024' }
    ];
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'En cours': 'status-progress',
      'Terminé': 'status-completed',
      'Validé': 'status-completed',
      'En attente': 'status-pending',
      'À valider': 'status-pending',
      'Retard': 'status-late'
    };
    return statusMap[status] || 'status-default';
  }

  getChartHeight(value: number): string {
    const maxValue = Math.max(...this.chartData.map(d => d.value));
    const percentage = (value / maxValue) * 100;
    return `${percentage}%`;
  }

  get isAdmin(): boolean {
    return this.userInfo.role === 'ADMIN';
  }

  get isChef(): boolean {
    return this.userInfo.role === 'CHEF';
  }

  get isEmploye(): boolean {
    return this.userInfo.role === 'EMPLOYE';
  }
}