import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardLayoutComponent } from './pages/dashboard-layout/dashboard-layout.component';
import { isAuthenticatedGuard } from '../auth/guards';
import { ListAbsencesComponent } from './pages/list-absences/list-absences.component';

const routes: Routes = [
  {
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: 'lista', loadComponent: () => import('./pages/list-absences/list-absences.component').then(m => m.ListAbsencesComponent), canActivate: [ isAuthenticatedGuard ] },
      { path: 'buscar', loadComponent: () => import('./pages/search-absence/search-absence.component').then(m => m.SearchAbsenceComponent), canActivate: [ isAuthenticatedGuard ] },
      { path: 'nueava-falta', loadComponent: () => import('./pages/new-absence/new-absence.component').then(m => m.NewAbsenceComponent), canActivate: [ isAuthenticatedGuard ] },
      {path: 'editar/:id', loadComponent: () => import('./pages/new-absence/new-absence.component').then(m => m.NewAbsenceComponent), canActivate: [ isAuthenticatedGuard ] },
      { path: '**', redirectTo: 'lista' },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DashboardRoutingModule { }
