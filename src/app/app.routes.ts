import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: 'auth',
        loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule ),
    },
    {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/pages/dashboard-layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent )
    },
    {
        path: '**',
        redirectTo: 'auth'
    }
];
