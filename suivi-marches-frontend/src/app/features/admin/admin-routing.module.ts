import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GestionEmployesComponent } from './pages/gestion-employes/gestion-employes.component';
import { GestionServicesComponent } from './pages/gestion-services/gestion-services.component';
import { RapportsComponent } from './pages/rapports/rapports.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard, RoleGuard],
    children: [
      { path: 'gestion-employes', component: GestionEmployesComponent },
      { path: 'gestion-services', component: GestionServicesComponent },
      { path: 'rapports', component: RapportsComponent },
      { path: '', redirectTo: 'gestion-employes', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule {}
