import { CdkListbox, CdkOption } from "@angular/cdk/listbox";
import { CdkTableModule } from "@angular/cdk/table";
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, inject, signal } from '@angular/core';
import { filter, map, retry, switchMap } from 'rxjs';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';
import { MatOptionSelectionChange, provideNativeDateAdapter } from "@angular/material/core";
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { AbsenceExtraInfoInterface, ProofInterface, SubjectInterface, UserInterface } from '../../interfaces';
import { AppFrontUrlEnum, CreateAbsenceFormControlEnum } from '../../enum';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { DashboardService } from '../../services/dashboard.service';
import { MaterialModule } from '../../../material/material.module';
import { SharedModule } from "../../../shared/shared.module";

@Component({
  selector: 'dashboard-list-absences',
  standalone: true,
  providers: [ provideNativeDateAdapter() ],
  imports: [
    CdkTableModule,
    CdkListbox,
    CdkOption,
    FormsModule,
    CommonModule,
    MaterialModule,
    SharedModule,
    ReactiveFormsModule
  ],
  templateUrl: './list-absences.component.html',
  styles: ``
})
export class ListAbsencesComponent implements OnInit {
  @ViewChild('radioRole') radioRole : any;

  private dashboardService = inject( DashboardService );
  private router           = inject( Router );
  private snackbar         = inject( MatSnackBar );
  private dialog           = inject( MatDialog );
  private year             : number                     = 0;
  private month            : number                     = 0;
  private day              : number                     = 0;
  private formattedDate    : string                     = '';

  public isLoading          = signal<boolean>(false);
  public dataSource         : AbsenceExtraInfoInterface[] = [];
  public filteredDataSource : AbsenceExtraInfoInterface[] = [];
  public displayedColumns   : string[]                    = ['position', 'date', 'description', 'proof', 'subject', 'name', 'role', 'dni', 'actions'];
  public controlName        : typeof CreateAbsenceFormControlEnum = CreateAbsenceFormControlEnum;
  public users              : UserInterface[]         = [];
  public userFilteredOption ?: UserInterface;
  public proofs             : ProofInterface[]        = [];
  public selectedProof     ?: ProofInterface;
  public subjects           : SubjectInterface[]      = [];
  public selectedRole      ?: string;
  public roles              : string[]                = ['profesor', 'estudiante'];
  public absenceForm        : FormGroup               = new FormGroup(
    {
      [this.controlName.id]: new FormControl<string>(''),
      [this.controlName.name]: new FormControl<string>(''),
      [this.controlName.lastName]: new FormControl<string>(''),
      [this.controlName.date]: new FormControl<string>(''),
      [this.controlName.absenceDescription]: new FormControl<string>(''),
      [this.controlName.subject]: new FormControl<string>(''),
      [this.controlName.proof]: new FormControl<string>(''),
      date: new FormControl<Date | null>(null),
      role: new FormControl<string>(''),
    }
  );

  constructor() { }
  
  ngOnInit(): void {
    this.getAbsencesExtraInfo();
    this.getProofs();
  }

  public getAbsencesExtraInfo() {
    this.isLoading.set(true);

    this.dashboardService.getAbsencesExtraInfo().subscribe({
      next: (response : AbsenceExtraInfoInterface[]) => {
        response.forEach((absence) => {
          absence.absenceDate = this.getDateFormatted(absence);
          this.isLoading.set(false);
        });
        this.dataSource = response;
      },
      error: (errorMessage : string) => {
        this.isLoading.set(false);
        this.showSnackbar(errorMessage);
      }
    });
  }

  public onEditAbsence(absence : AbsenceExtraInfoInterface) : void {
    this.router.navigateByUrl(`${AppFrontUrlEnum.editAbsence}${absence._id}`);
  }

  public onDeleteAbsence(enterAnimationDuration : string, exitAnimationDuration : string, absence : AbsenceExtraInfoInterface) : void {
    this.isLoading.set(true);
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      enterAnimationDuration,
      exitAnimationDuration,
      data: absence,
    });

    dialogRef.afterClosed()
      .pipe(
        filter((result: boolean) => result),
        filter((wasDelete) => wasDelete),
        switchMap(() => this.dashboardService.deleteAbsence(absence._id)),
        map((result) => window.location.reload())
      )
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          window.location.reload();
        },
        error: (err) => {
          this.isLoading.set(false);
          this.showSnackbar('Error al eliminar la falta');
        }
      });
  }

  public getDateFormatted(absence : AbsenceExtraInfoInterface) : string {
    const dates = absence.absenceDate.split('T')[0];
    const datesSplitted = dates.split('-');
    return `${datesSplitted[2]}-${datesSplitted[1]}-${datesSplitted[0]}`;
  }

  public showSnackbar(message : string) : void {
    this.snackbar.open(message, 'done', {
      duration: 25000,
    });
  }

  // Funciones para el filtrado de faltas
  public deleteFilters() {
    this.filteredDataSource = [];
    this.formattedDate = '';
    this.users = [];
    this.proofs = [];
    this.subjects = [];
    this.selectedRole = '';
    this.roles = [];
    this.absenceForm.get(this.controlName.name)?.setValue('');
    this.absenceForm.get(this.controlName.lastName)?.setValue('');
    this.absenceForm.get(this.controlName.subject)?.setValue('');
    this.absenceForm.get(this.controlName.proof)?.setValue('');
    this.absenceForm.get('role')?.setValue('');

    this.absenceForm.get(this.controlName.name)?.setErrors(null);
    this.absenceForm.get(this.controlName.lastName)?.setErrors(null);
    this.absenceForm.get(this.controlName.subject)?.setErrors(null);
    this.absenceForm.get(this.controlName.proof)?.setErrors(null);
    this.absenceForm.get('role')?.setErrors(null);

    this.roles = ['profesor', 'estudiante'];
    this.getProofs();
  }

  public getProofs() : void {
    this.isLoading.set(true);
    this.dashboardService.getProofs()
      .subscribe({
        next: (response) => {
          this.isLoading.set(false);
          this.proofs = response;
        },
        error: (err) => {
          this.isLoading.set(false);
          this.proofs = [];
        }
      })
  }

  public onSearchUser() {
    const { [this.controlName.name]:name } = this.absenceForm.value;
    this.dashboardService.getSuggestedUser(name, 0)
      .subscribe({
        next: (response : UserInterface[]) => {
          this.users = response;
        },
        error: (err) => {
          this.users = [];
        }
      });
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
    this.users = [user]
  }

  public onSelectRole(actualRole : string) {
    this.selectedRole = actualRole;
  }

  public onSearchSubject() : void {
    this.dashboardService.getSubjectByName(this.absenceForm.value[this.controlName.subject], 0)
      .subscribe({
        next: (response : SubjectInterface[]) => {
          if(response.length === 0) {
            this.subjects = [];
          }

          this.subjects = response;
        },
        error: (err) => {
          this.subjects = [];
        }
      });
  }

  public onSelectDate() {
    this.year          = new Date(this.absenceForm.value.date).getFullYear();
    this.month         = new Date(this.absenceForm.value.date).getMonth() + 1;
    this.day           = new Date(this.absenceForm.value.date).getDate();
    this.formattedDate = `${this.year}-${this.addZero(this.month)}-${this.addZero(this.day)}`;
  }

  public showSnackBar(message : string, duration : number) : void {
    this.snackbar.open(message, 'done', {
      duration
    });
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

  public onApplyFilter() {
    this.filteredDataSource = [];
    this.isLoading.set(true);
    this.dataSource.forEach((data) => {
      // Revisando que los campos tengan información
      // TODOS LOS CAMPOS
      if(
        this.formattedDate &&
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value[this.controlName.subject] !== '' &&
        this.absenceForm.value[this.controlName.proof] !== '' &&
        this.absenceForm.value.role !== ''
        ) {

        if (
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName &&
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName &&
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof &&
          this.absenceForm.value.role === data.user.role
          ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      // 4 CAMPOS
      if (
        this.formattedDate &&
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value[this.controlName.subject] !== '' &&
        this.absenceForm.value[this.controlName.proof] !== ''
      ) {
        if(
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName &&
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName &&
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.formattedDate &&
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value[this.controlName.subject] !== '' &&
        this.absenceForm.value.role !== ''
      ) {
        if(
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName &&
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName &&
          this.absenceForm.value.role === data.user.role
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      // 3 CAMPOS
      if (
        this.formattedDate &&
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value[this.controlName.subject] !== ''
      ) {
        if(
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName &&
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if(
        this.formattedDate &&
        this.absenceForm.value[this.controlName.subject] !== '' &&
        this.absenceForm.value[this.controlName.proof] !== ''
      ) {
        if (
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName &&
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.formattedDate &&
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value[this.controlName.proof] !== ''
      ) {
        if (
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.formattedDate &&
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value.role !== ''
      ) {
        if(
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName &&
          this.absenceForm.value.role === data.user.role
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.formattedDate &&
        this.absenceForm.value[this.controlName.subject] !== '' &&
        this.absenceForm.value[this.controlName.proof] !== ''
      ) {
        if (
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName &&
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.absenceForm.value[this.controlName.subject] !== '' &&
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value[this.controlName.proof] !== ''
      ) {
        if (
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName &&
          this.absenceForm.value[this.controlName.name]?.name === data.user?.name &&
          this.absenceForm.value[this.controlName.name]?.lastName === data.user?.lastName &&
          this.absenceForm.value[this.controlName.proof]?.proof === data.proof?.proof
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.absenceForm.value[this.controlName.subject] !== '' &&
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value.role !== ''
      ) {
        if (
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName &&
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName &&
          this.absenceForm.value.role === data.user.role
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if(
        this.absenceForm.value[this.controlName.subject] !== '' &&
        this.absenceForm.value.role !== '' &&
        this.absenceForm.value[this.controlName.proof] !== ''
      ) {
        if (
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName &&
          this.absenceForm.value.role === data.user.role &&
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value[this.controlName.proof] !== '' &&
        this.absenceForm.value.role !== ''
      ) {
        if (
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName &&
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof &&
          this.absenceForm.value.role === data.user.role
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.absenceForm.value[this.controlName.proof] !== '' &&
        this.absenceForm.value.role !== '' &&
        this.formattedDate
      ) {
        if (
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof &&
          this.absenceForm.value.role === data.user.role &&
          this.formattedDate === data.absenceDate
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      // 2 CAMPOS
      if (
        this.formattedDate &&
        this.absenceForm.value[this.controlName.name] !== ''
      ) {
        if (
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.formattedDate &&
        this.absenceForm.value[this.controlName.proof] !== ''
      ) {
        if (
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.formattedDate &&
        this.absenceForm.value[this.controlName.subject] !== ''
      ) {
        if (
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.formattedDate &&
        this.absenceForm.value.role !== ''
      ) {
        if (
          this.formattedDate === data.absenceDate &&
          this.absenceForm.value.role === data.user.role
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value[this.controlName.proof] !== ''
      ) {
        if(
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName &&
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value[this.controlName.subject] !== ''
      ) {
        if (
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName &&
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName

        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.absenceForm.value[this.controlName.name] !== '' &&
        this.absenceForm.value.role !== ''
      ) {
        if (
          this.absenceForm.value[this.controlName.name].name === data.user.name &&
          this.absenceForm.value[this.controlName.name].lastName === data.user.lastName &&
          this.absenceForm.value.role === data.user.role
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.absenceForm.value[this.controlName.proof] !== '' &&
        this.absenceForm.value[this.controlName.subject] !== ''
      ) {
        if (
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof &&
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.absenceForm.value[this.controlName.proof] !== '' &&
        this.absenceForm.value.role !== ''
      ) {
        if (
          this.absenceForm.value[this.controlName.proof].proof === data.proof.proof &&
          this.absenceForm.value.role === data.user.role
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      if (
        this.absenceForm.value[this.controlName.subject] !== '' &&
        this.absenceForm.value.role !== ''
      ) {
        if (
          this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName &&
          this.absenceForm.value.role === data.user.role
        ) {
          this.filteredDataSource.push(data);
        }
        return;
      }

      // 1 CAMPO
      if(this.formattedDate) {
        data.absenceDate === this.formattedDate
      }

      if(this.absenceForm.value[this.controlName.name].name === data.user.name && this.absenceForm.value[this.controlName.name].lastName === data.user.lastName) {
        this.filteredDataSource.push(data);
      }

      if (this.absenceForm.value[this.controlName.subject]?.subjectName === data.subject?.subjectName) {
        this.filteredDataSource.push(data);
      }

      if (this.absenceForm.value.role === data.user.role) {
        this.filteredDataSource.push(data);
      }

      if (this.absenceForm.value[this.controlName.proof].proof === data.proof.proof) {
        this.filteredDataSource.push(data);
      }
    });

    if(this.filteredDataSource.length === 0) {
      this.showSnackBar('No hay faltas que concuerden con los filtros.', 3000);
    }
    this.isLoading.set(false);
  }
}