import { AuthFrontUrlEnum } from '../../enum';
import { AuthService } from '../../services/auth.service';
import { ChangePasswordInterface, UserInterface } from '../../interfaces';
import { SharedModule } from '../../../shared/shared.module';
import { ValidatorService } from '../../services/validator.service';

import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './change-password-page.component.html',
  styles: ``
})
export class ChangePasswordPageComponent {
  private fb                = inject( FormBuilder );
  private validatorService  = inject( ValidatorService );
  private authService       = inject(AuthService);
  private router            = inject(Router);

  public loginUrl : string  = AuthFrontUrlEnum.login;
  public isLoading          = signal<boolean>(false);
  public myForm : FormGroup = this.fb.group({
    dni: ['', [ Validators.required, Validators.minLength(8), Validators.maxLength(8) ]],
    password: ['', [ Validators.required, Validators.minLength(8) ]],
    password2: ['', [ Validators.required, Validators.minLength(8) ]],
  }, {
    Validators: [ this.validatorService.areFieldsEquals('password', 'password2') ]
  });
  public foundUser : UserInterface | null = null;

  public async  changePassword() {
    this.isLoading.set(true);
    const { dni, password, password2 } = this.myForm.value;

    const newPassword : ChangePasswordInterface = { password };

    if ( newPassword.password.length < 8) {
      Swal.fire({
        title: "Error",
        text: 'La contraseña debe ser menor o igual a 8 carácteres.',
        icon: "error"
      })
    }

    await this.authService.getAdminUserDni(dni, "administrador").subscribe({
      next: (response) => {
        this.foundUser = response[0];
        
        this.authService.changePassword(newPassword, this.foundUser).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.router.navigateByUrl(AuthFrontUrlEnum.login);
          },
          error: (errorResponse) => {
            this.isLoading.set(false);
            Swal.fire({
              title: "Error",
              text: 'Error al actualizar la contraseña',
              icon: "error"
            })
          }
        });

      },
      error: (errorResponse) => {
        this.isLoading.set(false);
        Swal.fire({
          title: "Error",
          text: 'Error al actualizar la contraseña',
          icon: "error"
        });
      }
    });
  }

  public isEmptyField() : boolean {
    if(this.myForm.get('dni')?.hasError('required') || this.myForm.get('password')?.hasError('required') || this.myForm.get('password2')?.hasError('required')) {
      return true;
    }
    
    return false;
  }
}