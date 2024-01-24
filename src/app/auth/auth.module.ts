import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '../shared/shared.module';
import { LoginPageComponent } from './pages/login-page/login-page.component';
import { ChangePasswordPageComponent } from './pages/change-password-page/change-password-page.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';


@NgModule({
  declarations: [],
  imports: [
    AuthRoutingModule,
    AuthLayoutComponent,
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
  ]
})
export class AuthModule { }
