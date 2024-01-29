import { CdkTableModule } from "@angular/cdk/table";
import { CdkListbox, CdkOption } from '@angular/cdk/listbox';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { filter, map, switchMap } from "rxjs";
import { FormControl, FormGroup, ReactiveFormsModule } from "@angular/forms";

import { AbsenceExtraInfoInterface, ProofInterface, UserInterface } from '../../interfaces';
import { DashboardService } from '../../services/dashboard.service';
import { MaterialModule } from '../../../material/material.module';
import { AppFrontUrlEnum } from "../../enum";
import { ConfirmDialogComponent } from "../../components/confirm-dialog/confirm-dialog.component";
import { provideNativeDateAdapter } from "@angular/material/core";

@Component({
  selector: 'app-search-absence',
  standalone: true,
  providers: [ provideNativeDateAdapter() ],
  imports: [ CdkTableModule, CdkListbox, CdkOption, CommonModule, MaterialModule, ReactiveFormsModule ],
  templateUrl: './search-absence.component.html',
  styleUrls: [`./search-absence.component.scss`]
})
export class SearchAbsenceComponent implements OnInit {
  private dashboardService          = inject( DashboardService );
  private router                    = inject( Router );
  private snackbar                  = inject( MatSnackBar );
  private dialog                    = inject( MatDialog );
  private year             : number = 0;
  private month            : number = 0;
  private day              : number = 0;
  private formattedDate    : string = '';

  public userControl      : FormControl                 = new FormControl('');
  public proofControl     : FormControl                 = new FormControl('');
  public users            : UserInterface[]             = [];
  public proofs           : ProofInterface[]            = [];
  public roles            : string[]                    = ['profesor', 'estudiante'];
  public dataSource       : AbsenceExtraInfoInterface[] = [];
  public displayedColumns : string[]                    = ['position', 'date', 'description', 'proof', 'subject', 'name', 'role', 'dni', 'actions'];
  public range            : FormGroup                   = new FormGroup({ date: new FormControl<Date | null>(null) });
  // public date             : FormControl                 = new FormControl<Date | null>(null)
  
  ngOnInit(): void {
    this.getAllProofs();
  }

  public getAllProofs() : void {
    this.dashboardService.getProofs()
      .subscribe({
        next: (response : ProofInterface[]) => {
          this.proofs = response;
        },
        error: (err) => {
          this.showSnackbar('Hubo un error al obtener las justificaciones.');
        }
      });
  }

  public getProofSelected(proof : any) {
    console.log('getProofSelected: ', proof);
  }

  public getRoleSelected(role : string) {

  }

  public getResult() : void {

    console.log('getResult: ', this.range.value.date)
    console.log('year: ', new Date(this.range.value.date).getFullYear());
    console.log('month: ', new Date(this.range.value.date).getMonth() + 1);
    console.log('day: ', new Date(this.range.value.date).getDate());
    this.year          = new Date(this.range.value.date).getFullYear();
    this.month         = new Date(this.range.value.date).getMonth() + 1;
    this.day           = new Date(this.range.value.date).getDate();
    this.formattedDate = `${this.year}-${this.addZero(this.month)}-${this.addZero(this.day)}`;
    console.log('date formatted: ', this.formattedDate);
    this.dashboardService.getAbsenceByDate(this.formattedDate)
      .subscribe({
        next: (absences : AbsenceExtraInfoInterface[]) => {
          absences.forEach((absence, index) => {
            absences[index].absenceDate = this.getDateFormatted(absence);
          });
          this.dataSource = absences;
        },
        error: (err) => {
          this.dataSource = [];
          this.showSnackbar('Hubo un error al obtener las faltas.')
        }
      });
  }

  public onEditAbsence(absence : AbsenceExtraInfoInterface) : void {
    this.router.navigateByUrl(`${AppFrontUrlEnum.editAbsence}${absence._id}`);
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

  public onDeleteAbsence(enterAnimationDuration : string, exitAnimationDuration : string, absence : AbsenceExtraInfoInterface) : void {
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
          window.location.reload();
        },
        error: (err) => {
          this.showSnackbar('Hubo un error al eliminar la falta.');
        }
      });
  }

  public getDateFormatted(absence : AbsenceExtraInfoInterface) : string {
    const dates = absence.absenceDate.split('T')[0];
    const datesSplitted = dates.split('-');
    return `${datesSplitted[2]}-${datesSplitted[1]}-${datesSplitted[0]}`;
  }

  public onSearchAbsence() {

  }

  public showSnackbar(message : string) : void {
    this.snackbar.open(message, 'done', {
      duration: 25000,
    });
  }
}
