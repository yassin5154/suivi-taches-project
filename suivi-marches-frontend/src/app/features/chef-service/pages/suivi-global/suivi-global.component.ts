import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { ChefServiceService, KpiData, TaskDetail, ChartData } from '../../../../core/services/chefservice.service';
import { AuthService } from '../../../../core/services/auth.service';

// Register Chart.js components
Chart.register(...registerables);

@Component({
  selector: 'app-suivi-global',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suivi-global.component.html',
  styleUrls: ['./suivi-global.component.css']
})
export class SuiviGlobalComponent implements OnInit, AfterViewInit, OnDestroy {
  
  // Data properties
  kpiData: KpiData = {
    totalBesoins: 0,
    totalTaches: 0,
    tachesTerminees: 0,
    tachesRetard: 0
  };

  taskTable: TaskDetail[] = [];
  chartData: ChartData | null = null;
  loading: boolean = true;
  
  // Chart instances
  private statusChart: Chart | null = null;
  private employeeChart: Chart | null = null;
  private progressChart: Chart | null = null;
  private radarChart: Chart | null = null;
  private comparisonChart: Chart | null = null;

  // Chef service ID from auth
  private chefServiceId: number;

  constructor(
    private http: HttpClient,
    private chefService: ChefServiceService,
    private authService: AuthService
  ) {
    this.chefServiceId = this.authService.getCurrentUserId() || 2; // Fallback to ID 2
  }

  ngOnInit(): void {
    this.loadAllData();
  }

  ngAfterViewInit(): void {
    // Wait for data to load before creating charts
    setTimeout(() => {
      this.createCharts();
    }, 500);
  }

  ngOnDestroy(): void {
    this.destroyCharts();
  }

  // ========== DATA LOADING METHODS ==========

  loadAllData(): void {
    this.loading = true;
    
    // Load KPIs
    this.chefService.getServiceAnalytics(this.chefServiceId).subscribe({
      next: (data) => {
        this.kpiData = data;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading KPIs:', error);
        this.loadMockKpis();
        this.checkLoadingComplete();
      }
    });

    // Load task details
    this.chefService.getTasksDetails(this.chefServiceId).subscribe({
      next: (data) => {
        this.taskTable = data;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading tasks:', error);
        this.loadMockTaskTable();
        this.checkLoadingComplete();
      }
    });

    // Load chart data
    this.chefService.getChartData(this.chefServiceId).subscribe({
      next: (data) => {
        this.chartData = data;
        this.checkLoadingComplete();
      },
      error: (error) => {
        console.error('Error loading chart data:', error);
        this.chartData = this.getMockChartData();
        this.checkLoadingComplete();
      }
    });
  }

  private checkLoadingComplete(): void {
    // Check if all data is loaded
    if (this.kpiData && this.taskTable && this.chartData) {
      this.loading = false;
      // Re-create charts with real data
      setTimeout(() => this.createCharts(), 100);
    }
  }

  // ========== CHART CREATION METHODS ==========

  createCharts(): void {
    this.createStatusChart();
    this.createEmployeeChart();
    this.createProgressChart();
    this.createRadarChart();
    this.createComparisonChart();
  }

  createStatusChart(): void {
    const canvas = document.getElementById('statusChart') as HTMLCanvasElement;
    if (!canvas || !this.chartData) return;

    const config: ChartConfiguration = {
      type: 'doughnut',
      data: {
        labels: this.chartData.statusLabels,
        datasets: [{
          data: this.chartData.statusData,
          backgroundColor: [
            'rgba(66, 165, 245, 0.8)',
            'rgba(102, 187, 106, 0.8)',
            'rgba(239, 83, 80, 0.8)'
          ],
          borderColor: [
            '#42A5F5',
            '#66BB6A',
            '#EF5350'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              padding: 15,
              font: {
                size: 12,
                family: 'Inter'
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8,
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: any) => a + (typeof b === 'number' ? b : 0), 0);
                const percentage = Math.round((value / total) * 100);
                return `${label}: ${value} (${percentage}%)`;
              }
            }
          }
        }
      }
    };

    this.statusChart = new Chart(canvas, config);
  }

  createEmployeeChart(): void {
    const canvas = document.getElementById('employeeChart') as HTMLCanvasElement;
    if (!canvas || !this.chartData) return;

    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.chartData.employeeLabels,
        datasets: [{
          label: 'Tâches Complétées',
          data: this.chartData.employeeData,
          backgroundColor: 'rgba(21, 101, 192, 0.8)',
          borderColor: '#1565C0',
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              font: {
                family: 'Inter'
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                family: 'Inter'
              }
            }
          }
        }
      }
    };

    this.employeeChart = new Chart(canvas, config);
  }

  createProgressChart(): void {
    const canvas = document.getElementById('progressChart') as HTMLCanvasElement;
    if (!canvas) return;

    // Mock data for progress over time (vous pouvez adapter avec des données réelles)
    const mockData = {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      data: [8, 12, 15, 11, 14, 6, 4]
    };

    const config: ChartConfiguration = {
      type: 'line',
      data: {
        labels: mockData.labels,
        datasets: [{
          label: 'Tâches Complétées',
          data: mockData.data,
          borderColor: '#1565C0',
          backgroundColor: 'rgba(21, 101, 192, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#1565C0',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 5,
          pointHoverRadius: 7
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            cornerRadius: 8
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.progressChart = new Chart(canvas, config);
  }

  createRadarChart(): void {
    const canvas = document.getElementById('radarChart') as HTMLCanvasElement;
    if (!canvas) return;

    const mockData = {
      labels: ['Ponctualité', 'Vitesse', 'Charge', 'Qualité', 'Efficacité'],
      data: [85, 78, 90, 88, 82]
    };

    const config: ChartConfiguration = {
      type: 'radar',
      data: {
        labels: mockData.labels,
        datasets: [{
          label: 'Performance Globale',
          data: mockData.data,
          backgroundColor: 'rgba(21, 101, 192, 0.2)',
          borderColor: '#1565C0',
          borderWidth: 2,
          pointBackgroundColor: '#1565C0',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        scales: {
          r: {
            beginAtZero: true,
            max: 100,
            ticks: {
              stepSize: 20,
              font: {
                family: 'Inter'
              }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.1)'
            }
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    };

    this.radarChart = new Chart(canvas, config);
  }

  createComparisonChart(): void {
    const canvas = document.getElementById('comparisonChart') as HTMLCanvasElement;
    if (!canvas || !this.chartData) return;

    // Utiliser les données de statut pour le graphique de comparaison
    const config: ChartConfiguration = {
      type: 'bar',
      data: {
        labels: this.chartData.statusLabels,
        datasets: [{
          label: 'Nombre de Tâches',
          data: this.chartData.statusData,
          backgroundColor: [
            'rgba(66, 165, 245, 0.8)',
            'rgba(102, 187, 106, 0.8)',
            'rgba(239, 83, 80, 0.8)'
          ],
          borderColor: [
            '#42A5F5',
            '#66BB6A',
            '#EF5350'
          ],
          borderWidth: 2,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            }
          },
          x: {
            grid: {
              display: false
            }
          }
        }
      }
    };

    this.comparisonChart = new Chart(canvas, config);
  }

  // ========== UTILITY METHODS ==========

  getPercentage(value: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  }

  getStatusClass(statut: string): string {
    switch (statut) {
      case 'EN_COURS':
        return 'status-en-cours';
      case 'TERMINEE':
        return 'status-terminee';
      case 'EN_RETARD':
        return 'status-en-retard';
      default:
        return '';
    }
  }

  getStatusLabel(statut: string): string {
    switch (statut) {
      case 'EN_COURS':
        return 'En Cours';
      case 'TERMINEE':
        return 'Terminée';
      case 'EN_RETARD':
        return 'En Retard';
      default:
        return statut;
    }
  }

  getDifferenceClass(difference: string): string {
    if (difference.startsWith('-')) {
      return 'difference-positive';
    } else if (difference.startsWith('+')) {
      return 'difference-negative';
    } else {
      return 'difference-neutral';
    }
  }

  // ========== MOCK DATA METHODS ==========

  private loadMockKpis(): void {
    this.kpiData = {
      totalBesoins: 48,
      totalTaches: 156,
      tachesTerminees: 78,
      tachesRetard: 12
    };
  }

  private loadMockTaskTable(): void {
    this.taskTable = [
      {
        tache: 'Rapport Q4',
        employe: 'Ahmed Benali',
        besoin: 'Analyse Financière',
        dateDebut: '2025-01-15',
        duree: '5 jours',
        statut: 'EN_COURS',
        difference: '+2j',
        progression: 65
      },
      {
        tache: 'Audit Interne',
        employe: 'Fatima Zahra',
        besoin: 'Contrôle Qualité',
        dateDebut: '2025-01-10',
        duree: '3 jours',
        statut: 'TERMINEE',
        difference: '-1j',
        progression: 100
      }
    ];
  }

  private getMockChartData(): ChartData {
    return {
      statusLabels: ['En Cours', 'Terminées', 'En Retard'],
      statusData: [66, 78, 12],
      employeeLabels: ['Ahmed', 'Fatima', 'Youssef', 'Salma', 'Karim'],
      employeeData: [23, 19, 15, 12, 9]
    };
  }

  private destroyCharts(): void {
    if (this.statusChart) this.statusChart.destroy();
    if (this.employeeChart) this.employeeChart.destroy();
    if (this.progressChart) this.progressChart.destroy();
    if (this.radarChart) this.radarChart.destroy();
    if (this.comparisonChart) this.comparisonChart.destroy();
  }

  // ========== REFRESH METHOD ==========
  refreshData(): void {
    this.destroyCharts();
    this.loading = true;
    this.loadAllData();
  }
}