import { Component, inject, signal } from '@angular/core';
import { LoadingWheelComponent } from '../../../shared/loading-wheel/loading-wheel.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ValidatorService } from '../../services/validator.service';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { AuthFrontUrlEnum } from '../../enum';
import Swal from 'sweetalert2';
import { UserInterface } from '../../interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-change-password-page',
  standalone: true,
  imports: [CommonModule, LoadingWheelComponent, ReactiveFormsModule, RouterModule],
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

  public changePassword() {
    this.isLoading.set(true);
    const { dni, password, password2 } = this.myForm.value;

    this.authService.getUserByDni(dni).subscribe({
      next: (response) => {
        this.foundUser = response[0];

        this.authService.changePassword(password, this.foundUser).subscribe({
          next: (response) => {
            this.isLoading.set(false);
            this.router.navigateByUrl(AuthFrontUrlEnum.login);
          },
          error: (errorResponse) => {
            this.isLoading.set(false);
            console.log({errorResponse});
            Swal.fire({
              title: "Error",
              text: errorResponse,
              icon: "error"
            })
          }
        });

      },
      error: (errorResponse) => {
        this.isLoading.set(false);
        console.log({errorResponse});
        Swal.fire({
          title: "Error",
          text: errorResponse,
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
