import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChefServiceRoutingModule } from './chef-service-routing.module';
import { ValidationTachesComponent } from './pages/validation-taches/validation-taches.component';
import { SuiviGlobalComponent } from './pages/suivi-global/suivi-global.component';
import { StatistiquesComponent } from './pages/statistiques/statistiques.component';
import { ChartViewComponent } from './components/chart-view/chart-view.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ChefServiceRoutingModule
  ]
})
export class ChefServiceModule { }
