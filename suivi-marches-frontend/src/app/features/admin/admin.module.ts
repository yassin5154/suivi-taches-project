import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { GestionEmployesComponent } from './pages/gestion-employes/gestion-employes.component';
import { GestionServicesComponent } from './pages/gestion-services/gestion-services.component';
import { RapportsComponent } from './pages/rapports/rapports.component';
import { UserCardComponent } from './components/user-card/user-card.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
