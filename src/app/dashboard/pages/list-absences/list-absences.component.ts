import { CdkTableModule } from "@angular/cdk/table";
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { filter, map, switchMap } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

import { AbsenceExtraInfoInterface } from '../../interfaces';
import { AppFrontUrlEnum } from '../../enum';
import { ConfirmDialogComponent } from '../../components/confirm-dialog/confirm-dialog.component';
import { DashboardService } from '../../services/dashboard.service';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'dashboard-list-absences',
  standalone: true,
  imports: [ CdkTableModule, CommonModule, MaterialModule ],
  templateUrl: './list-absences.component.html',
  styles: ``
})
export class ListAbsencesComponent implements OnInit {
  private dashboardService = inject( DashboardService );
  private router           = inject( Router );
  private snackbar         = inject( MatSnackBar );
  private dialog           = inject( MatDialog );

  public dataSource       : AbsenceExtraInfoInterface[] = [];
  public displayedColumns : string[]                    = ['position', 'date', 'description', 'proof', 'subject', 'name', 'role', 'dni', 'actions'];

  constructor() { }

  ngOnInit(): void {
    this.getAbsencesExtraInfo();
  }

  public getAbsencesExtraInfo() {
    this.dashboardService.getAbsencesExtraInfo().subscribe({
      next: (response : AbsenceExtraInfoInterface[]) => {
        response.forEach((absence) => {
          absence.absenceDate = this.getDateFormatted(absence);
        });
        this.dataSource = response;
      },
      error: (errorMessage : string) => {
        this.showSnackbar(errorMessage);
      }
    });
  }

  public onEditAbsence(absence : AbsenceExtraInfoInterface) : void {
    this.router.navigateByUrl(`${AppFrontUrlEnum.editAbsence}${absence._id}`);
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
}
