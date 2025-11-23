import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeRoutingModule } from './employe-routing.module';
import { CreateNeedComponent } from './pages/create-need/create-need.component';
import { SuiviTachesComponent } from './pages/suivi-taches/suivi-taches.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { TacheCardComponent } from './components/tache-card/tache-card.component';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    EmployeRoutingModule
  ]
})
export class EmployeModule { }
