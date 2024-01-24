import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../../services/auth.service';
import { AuthFrontUrlEnum } from '../../enum';
import { SharedModule } from '../../../shared/shared.module';
import { LoadingWheelComponent } from '../../../shared/loading-wheel/loading-wheel.component';
import { response } from 'express';

@Component({
  selector: 'auth-login-page',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, RouterModule, LoadingWheelComponent ],
  templateUrl: './login-page.component.html',
  styles: ``
})
export class LoginPageComponent {
  private authService                 = inject( AuthService );
  private fb                          = inject( FormBuilder );
  private router                      = inject(Router);

  public changPasswordUrl : string    = AuthFrontUrlEnum.changePassword;
  public isLoading                    = signal<boolean>(false);
  public myForm           : FormGroup = this.fb.group({
    dni:      ['', [ Validators.required, Validators.minLength(8), Validators.maxLength(8) ]],
    password: ['', [ Validators.required, Validators.minLength(8) ]]
  });

  public async login() : Promise<void> {
    this.isLoading.set(true);
    const { dni, password } = this.myForm.value;
    
    this.authService.login(dni, password).subscribe({
      next: (response) => {
        this.isLoading.set(false);
        this.router.navigateByUrl('dashboard');
      },
      error: (errorMessage) => {
        console.log({errorMessage});
        this.isLoading.set(false);
        Swal.fire({
          title: "Error",
          text: errorMessage,
          icon: "error"
        });
      }
    });    
  }

  public isEmptyField() : boolean {
    if(this.myForm.get('dni')?.hasError('required') || this.myForm.get('password')?.hasError('required')) {
      return true;
    }
    
    return false;
  }
}
