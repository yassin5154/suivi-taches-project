import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateNeedComponent } from './pages/create-need/create-need.component';
import { SuiviTachesComponent } from './pages/suivi-taches/suivi-taches.component';
import { SuiviComponent } from './pages/suivi/suivi.component';
import { AuthGuard } from '../../core/guards/auth.guard';

const routes: Routes = [
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      { path: 'create-need', component: CreateNeedComponent },
      { path: 'suivi-taches', component: SuiviTachesComponent },
      { path: 'suivi', component: SuiviComponent },
      { path: '', redirectTo: 'suivi-taches', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeRoutingModule {}
