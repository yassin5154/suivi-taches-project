import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ValidationTachesComponent } from './pages/validation-taches/validation-taches.component';
import { SuiviGlobalComponent } from './pages/suivi-global/suivi-global.component';
import { StatistiquesComponent } from './pages/statistiques/statistiques.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    children: [
      { path: 'validation-taches', component: ValidationTachesComponent },
      { path: 'suivi-global', component: SuiviGlobalComponent },
      { path: 'statistiques', component: StatistiquesComponent },
      { path: '', redirectTo: 'suivi-global', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ChefServiceRoutingModule {}
