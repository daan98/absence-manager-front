import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DashboardService } from '../../services/dashboard.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MaterialModule } from '../../../material/material.module';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { AbsenceExtraInfoInterface, AbsenceInterface, CreateAbsenceInterface, ProofInterface, SubjectInterface, UserInterface } from '../../interfaces';
import { AppFrontUrlEnum, CreateAbsenceFormControlEnum } from '../../enum';
import { switchMap } from 'rxjs';
import { CommonModule } from '@angular/common';
import { MatOptionSelectionChange, provideNativeDateAdapter } from '@angular/material/core';
import { response } from 'express';
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';

@Component({
  selector: 'app-new-absence',
  standalone: true,
  providers: [ provideNativeDateAdapter() ],
  imports: [ ReactiveFormsModule, MaterialModule, CommonModule, FormsModule, CdkListbox, CdkOption ],
  templateUrl: './new-absence.component.html',
  styles: ``
})
export class NewAbsenceComponent implements OnInit {

  private dashboardService                             = inject(DashboardService);
  private activateRoute                                = inject(ActivatedRoute);
  private router                                       = inject(Router);
  private snackbar                                     = inject(MatSnackBar);
  private dialog                                       = inject(MatDialog);

  public year                : number                  = 0;
  public month               : number                  = 0;
  public day                 : number                  = 0;
  public createAbsenceBody  ?: CreateAbsenceInterface;
  public controlName         : typeof CreateAbsenceFormControlEnum = CreateAbsenceFormControlEnum;
  public users               : UserInterface[]         = [];
  public userFilteredOption ?: UserInterface;
  private userDni            : number                               = 0;
  public isUpdating          : boolean                 = false;
  public proofs              : ProofInterface[]        = [];
  public selectedProof      ?: ProofInterface;
  public subjects            : SubjectInterface[]      = [];
  public absenceForm         : FormGroup               = new FormGroup(
    {
      [this.controlName.id]: new FormControl<string>(''),
      [this.controlName.name]: new FormControl<string>(''),
      [this.controlName.lastName]: new FormControl<string>(''),
      [this.controlName.date]: new FormControl<string>(''),
      [this.controlName.absenceDescription]: new FormControl<string>(''),
      [this.controlName.subject]: new FormControl<string>(''),
      [this.controlName.proof]: new FormControl<string>('')
    }
  );

  constructor() {}

  ngOnInit(): void {
    this.getProofs();
    if(this.router.url.includes('editar')) {
      console.log('editando');
      this.isUpdating = true;
      this.getCurrentAbsenceInformation();
    }
  }

  get currentAbsence() : AbsenceExtraInfoInterface {
    const absence = this.absenceForm.value as AbsenceExtraInfoInterface;
    return absence;
  }

  public getProofs() : void {
    this.dashboardService.getProofs()
      .subscribe({
        next: (response) => {
          this.proofs = response;
        },
        error: (err) => {
          this.proofs = [];
        }
      })
  }

  public onSearchSubject() : void {
    this.dashboardService.getSubjectByName(this.absenceForm.value[this.controlName.subject], 6)
      .subscribe({
        next: (response : SubjectInterface[]) => {
          if(response.length === 0) {
            this.subjects = [];
          }

          this.subjects = response;
          console.log('subjects: ', this.subjects);
        },
        error: (err) => {
          this.subjects = [];
        }
      });
  }

  public onSubmitForm() : void {
    if (this.absenceForm.invalid) {
      const fieldValueArray : [] = Object.values(this.absenceForm.value) as [];
      const fieldTitleArray : [] = Object.keys(this.absenceForm.value) as [];
      const emptyFieldFound = this.checkEmptyField(fieldValueArray, fieldTitleArray);

      this.showSnackBar(emptyFieldFound.message, 2500);
      return;
    }

    //Formating date
    this.year                                     = new Date(this.absenceForm.value[this.controlName.date]).getFullYear();
    this.month                                    = new Date(this.absenceForm.value[this.controlName.date]).getMonth() + 1;
    this.day                                      = new Date(this.absenceForm.value[this.controlName.date]).getDate();
    this.absenceForm.value[this.controlName.date] = `${this.year}-${this.addZero(this.month)}-${this.addZero(this.day)}`;

    // Checking if proof is "other"
    if(this.absenceForm.value[this.controlName.proof].proof === "otro" && !this.absenceForm.value[this.controlName.absenceDescription]) {
      this.showSnackBar('Por favor especifique la razón de su falta.', 2500);
      return;
    }
    
    this.createAbsenceBody = {
      absenceDate: this.currentAbsence.absenceDate,
      absenceDescription: this.currentAbsence.absenceDescription,
      proof: this.currentAbsence.proof._id,
      subject: this.currentAbsence.subject._id,
      user: this.currentAbsence.user._id,
    };
    console.log('createAbsenceBody: ', this.createAbsenceBody);
    this.dashboardService.createAbsence(this.createAbsenceBody)
      .subscribe({
        next: (newAbsence) => {
          this.router.navigate([AppFrontUrlEnum.editAbsence, newAbsence._id]);
          this.showSnackBar('Falta creada exitosamente.', 2500);
        },
        error: (err) => {
          this.showSnackBar('Hubo un erorr al crear la falta.', 2500);
        }
      })
  }

  /* Se crea la función "onUpdateAbsece" para:
  -- evitar posibles errores en la función "onSubmitForm"
  -- no tener una función con tantas lineas de código
  */
  public onUpdateAbsece() : void {
    if (this.absenceForm.invalid) {
      const fieldValueArray : [] = Object.values(this.absenceForm.value) as [];
      const fieldTitleArray : [] = Object.keys(this.absenceForm.value) as [];
      const emptyFieldFound = this.checkEmptyField(fieldValueArray, fieldTitleArray);

      this.showSnackBar(emptyFieldFound.message, 2500);
      return;
    }

    // Actualizar la falta
      // ¿HACE FALTA? (INICIO)
      this.year                                     = new Date(this.absenceForm.value[this.controlName.date]).getFullYear();
      this.month                                    = new Date(this.absenceForm.value[this.controlName.date]).getMonth() + 1;
      this.day                                      = new Date(this.absenceForm.value[this.controlName.date]).getDate();
      this.absenceForm.value[this.controlName.date] = `${this.year}-${this.addZero(this.month)}-${this.addZero(this.day)}`;
      // ¿HACE FALTA? (FIN)

      // Obteniendo el ID del usuario para actualizar
      if(!this.absenceForm.value[this.controlName.name]._id) {
        // Obtener el id del usuario
        console.log('userDni: ', this.userDni);
        this.dashboardService.getUserByDni(this.userDni)
          .subscribe({
            next: (foundUser : UserInterface[]) => {
              this.absenceForm.get(this.controlName.name)?.setValue(foundUser[0]);

              //COPIANDO AQUI (INICIO)
              // Obteniendo el id de la materia para actualizar
              this.dashboardService.getSubjectByName(this.absenceForm.value[this.controlName.subject], 1)
              .subscribe({
                next: (foundSubject : SubjectInterface[]) => {
                  this.absenceForm.value[this.controlName.subject] = foundSubject[0]

                  // Checking if proof is "other"
                  if(this.absenceForm.value[this.controlName.proof].proof === "otro" && !this.absenceForm.value[this.controlName.absenceDescription]) {
                    this.showSnackBar('Por favor especifique la razón de su falta.', 2500);
                    return;
                  }
                  const subject : SubjectInterface = this.absenceForm.value[this.controlName.absenceDescription];

                  this.createAbsenceBody = {
                    absenceDate: `${this.year}-${this.addZero(this.month)}-${this.addZero(this.day)}`,
                    absenceDescription: this.absenceForm.value[this.controlName.absenceDescription],
                    proof: this.currentAbsence.proof?._id,
                    subject: foundSubject[0]?._id,
                    user: foundUser[0]?._id,
                  };
                  console.log(foundUser);

                  console.log('createAbsenceBody: ', this.createAbsenceBody);
                  // Actualizando información de falta
                  this.dashboardService.updateAbsece(this.createAbsenceBody, this.absenceForm.value[this.controlName.id])
                    .subscribe({
                      next: (updatedAbsence) => {
                        console.log('updatedAbsence: ', updatedAbsence);
                        this.router.navigateByUrl('/');
                        this.showSnackBar('Falta actualizada correctamente.', 2500);
                      },
                      error: (err) => {
                        this.showSnackBar(err.message, 2500);
                      }
                    }
                  );
                },
                error: (err) => {
                  this.showSnackBar('Hubo un error al buscar la información de la materia', 2500);
                }
              });
              // COPIANDO AQUI (FIN)
            },
            error: (err) => {
              this.showSnackBar('Hubo un error al buscar la información del usuario.', 2500);
            }
          });
          return;
      }

      // Obteniendo el id de la materia para actualizar
      this.dashboardService.getSubjectByName(this.absenceForm.value[this.controlName.subject], 1)
        .subscribe({
          next: (foundSubject : SubjectInterface[]) => {
            this.absenceForm.value[this.controlName.subject] = foundSubject[0]

            // Revisando que campo justificación sea "otro"
            if(this.absenceForm.value[this.controlName.proof].proof === "otro" && !this.absenceForm.value[this.controlName.absenceDescription]) {
              this.showSnackBar('Por favor especifique la razón de su falta.', 2500);
              return;
            }

            const subject : SubjectInterface = this.absenceForm.value[this.controlName.absenceDescription];
            
            this.createAbsenceBody = {
              absenceDate: `${this.year}-${this.addZero(this.month)}-${this.addZero(this.day)}`,
              absenceDescription: this.absenceForm.value[this.controlName.absenceDescription],
              proof: this.currentAbsence.proof._id,
              subject: foundSubject[0]._id,
              user: this.currentAbsence.user?._id,
            };

            console.log('createAbsenceBody: ', this.createAbsenceBody);

            // Actualizando información de falta
            this.dashboardService.updateAbsece(this.createAbsenceBody, this.absenceForm.value[this.controlName.id])
              .subscribe({
                next: (updatedAbsence) => {
                  console.log('updatedAbsence: ', updatedAbsence);
                  this.router.navigateByUrl('/');
                  this.showSnackBar('Falta actualizada correctamente.', 2500);
                },
                error: (err) => {
                  this.showSnackBar(err.message, 2500);
                }
              }
            );
            return;
          },
          error: (err) => {
            this.showSnackBar('Hubo un error al buscar la información de la materia', 2500);
          }
        });
  }

  public getCurrentAbsenceInformation() {
    this.activateRoute.params
      .pipe(
        switchMap(({ id }) => this.dashboardService.getAbsence(id))
      )
      .subscribe({
        next: (response : AbsenceExtraInfoInterface) => {
          console.log('current absence response: ', response);
          if(!response) {
            this.router.navigateByUrl('/');
            this.showSnackBar('No se encontro información de la falta.', 2500);
            return;
          }

          const { _id, absenceDate, absenceDescription, proof, subject, user } = response;
          
          this.selectedProof = proof;
          this.userDni       = user.dni;

          this.absenceForm.get(this.controlName.id)?.setValue(_id);
          this.absenceForm.get(this.controlName.name)?.setValue(user.name);
          this.absenceForm.get(this.controlName.lastName)?.setValue(user.lastName);
          this.absenceForm.get(this.controlName.proof)?.setValue(proof);
          this.absenceForm.get(this.controlName.absenceDescription)?.setValue(absenceDescription);
          this.absenceForm.get(this.controlName.subject)?.setValue(subject.subjectName);
          this.absenceForm.get(this.controlName.date)?.setValue(absenceDate);
          console.log('absenceForm in get current info: ', this.absenceForm.value);
        },
        error: (err) => {
          this.router.navigateByUrl('/');
          this.showSnackBar('Hubo un error al obtener información de la falta.', 3000);
        }
      });
  }

  /* public onSelectProof(selectProof : any) {
    console.log('onSelectProof: ', selectProof);
    // this.selectedProof = selectProof;
  } */

  public onSearchUser() {
    console.log('onSearchUser: ', this.absenceForm.value);
    const { [this.controlName.name]:name } = this.absenceForm.value;
    console.log('nombre:', name);
    this.dashboardService.getSuggestedUser(name, 3)
      .subscribe({
        next: (response : UserInterface[]) => {
          /* if(response.length === 0) {
            this.users = [];
            return
          } */
          console.log('response: ', response);
          this.users = response;
        },
        error: (err) => {
          this.users = [];
        }
      });
  }

  public showSnackBar(message : string, duration : number) : void {
    this.snackbar.open(message, 'done', {
      duration
    });
  }

  public onSelectedUser(event : MatOptionSelectionChange) : void {
    if(!event.source.value) {
      this.userFilteredOption = undefined;
    }

    if(!event.isUserInput) {
      return;
    }

    const user : UserInterface = event.source.value;
    this.absenceForm.get(this.controlName.name)?.setValue(`${user.name}`);
    this.absenceForm.get(this.controlName.lastName)?.setValue(user.lastName);
    this.userFilteredOption = user;
    this.users = [user];
    console.log(user); 
  }

  public onSelectedSubject(event : MatOptionSelectionChange) : void {
    if(!event.source.value) {
      this.userFilteredOption = undefined;
    }

    if(!event.isUserInput) {
      return;
    }

    const subject : SubjectInterface = event.source.value;
    this.absenceForm.get(this.controlName.subject)?.setValue(subject.subjectName);
    this.subjects = [subject];
  }

  private checkEmptyField(fields : [], fieldsTitle : []) {
    let emptyFieldAmount : number = -1;
    let emptyFieldTitle  : string = '';

    fields.forEach((field, index) => {
      if(!field && fieldsTitle[index] !== 'descripcion' && fieldsTitle[index] !== 'id') {
        emptyFieldAmount += 1;
        emptyFieldTitle = fieldsTitle[index];
        console.log('title: ', fieldsTitle[index]);
      }
    });
    console.log('emptyFieldAmount: ', emptyFieldAmount);
    return {
      amount: emptyFieldAmount,
      message: emptyFieldAmount === 0 ? `El campo ${emptyFieldTitle.replaceAll('_', '')} esta vacio` : 'Hay campos vacios.',
    };
  }

  private translateFieldTitle(fieldTitle: string) : string {
    switch(fieldTitle) {
      case 'absenceDate':
        return 'fecha';
      break;

      case 'name':
        return "nombre";
      break;

      case 'lastName':
        return "apellido";
      break;

      case 'proof':
        return "justificación";
      break

      case 'absenceDescription':
        return "descripción";
      break;

      case 'subject':
        return "materia";
      break;

      default:
        return '';
    }
  }

  private addZero(value : number) : string {
    switch(value) {
      case 1:
        return '01';
      break;

      case 2:
        return '02';
      break;
      
      case 3:
        return '03';
      break;
      
      case 4:
        return '04';
      break;
      
      case 5:
        return '05';
      break;
      
      case 6:
        return '06';
      break;
      
      case 7:
        return '07';
      break;
      
      case 8:
        return '08';
      break;
      
      case 9:
        return '09';
      break;

      default:
        return value.toString();
    }
  }

  public goBack() : void {
    this.router.navigateByUrl(AppFrontUrlEnum.listAbsences);
  }
}
