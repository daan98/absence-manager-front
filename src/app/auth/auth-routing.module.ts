import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ChangePasswordPageComponent } from './pages/change-password-page/change-password-page.component';

const routes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', loadComponent: () => import("./pages/login-page/login-page.component").then(m => m.LoginPageComponent) },
      { path: 'change-password', loadComponent: () => import("./pages/change-password-page/change-password-page.component").then(m => m.ChangePasswordPageComponent) },
      { path: '**', redirectTo: 'login' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
