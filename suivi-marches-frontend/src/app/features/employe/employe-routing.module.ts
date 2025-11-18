import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateCpsComponent } from './pages/create-cps/create-cps.component';
import { SuiviTachesComponent } from './pages/suivi-taches/suivi-taches.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'create-cps', component: CreateCpsComponent },
      { path: 'suivi-taches', component: SuiviTachesComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: '', redirectTo: 'suivi-taches', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeRoutingModule {}
