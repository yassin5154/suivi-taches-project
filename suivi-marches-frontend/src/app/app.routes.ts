import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { LayoutComponent } from './layout/layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { NotFoundComponent } from './pages/not-found/not-found.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';
import { ProfileComponent } from './features/profile/profile.component';

export const routes: Routes = [
  // route publique
  { path: 'login', component: LoginComponent },

  // redirection par défaut → login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // routes protégées avec layout
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    children: [
      { path: 'dashboard',
            component: DashboardComponent,
            canActivate: [AuthGuard],
          },
      {
        path: 'employe',
        loadChildren: () =>
          import('./features/employe/employe.module').then(m => m.EmployeModule),
        canActivate: [RoleGuard],
        data: { role: 'EMPLOYE' },
      },
      {
        path: 'chef-service',
        loadChildren: () =>
          import('./features/chef-service/chef-service.module').then(m => m.ChefServiceModule),
        canActivate: [RoleGuard],
        data: { role: 'CHEF' },
      },
      {
        path: 'admin',
        loadChildren: () =>
          import('./features/admin/admin.module').then(m => m.AdminModule),
        canActivate: [RoleGuard],
        data: { role: 'ADMIN' },
      },
      {
        path: 'profile',
        component: ProfileComponent, // Utilisez directement le composant
        canActivate: [AuthGuard],
      },
    ],
  },

  // page 404
  { path: '**', component: NotFoundComponent },
];
