import { Component, OnInit, inject } from '@angular/core';
import { CdkTableModule } from "@angular/cdk/table";
import { DashboardService } from '../../services/dashboard.service';
import { AbsenceExtraInfoInterface } from '../../interfaces';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dashboard-list-absences',
  standalone: true,
  imports: [ CdkTableModule, CommonModule ],
  templateUrl: './list-absences.component.html',
  styles: ``
})
export class ListAbsencesComponent implements OnInit {
  private dashboardService = inject( DashboardService );

  public dataSource       : AbsenceExtraInfoInterface[] = [];
  public displayedColumns : string[]                    = ['position', 'date', 'description', 'proof', 'subject', 'name', 'role', 'dni'];

  constructor() { }

  ngOnInit(): void {
    this.getAbsencesExtraInfo();
  }

  public getAbsencesExtraInfo() {
    this.dashboardService.getAbsenceExtraInfo().subscribe({
      next: (response : AbsenceExtraInfoInterface[]) => {
        response.forEach((absence) => {
          absence.absenceDate = this.getDateFormatted(absence);
        });
        this.dataSource = response;
      },
      error: (errorMessage) => {

      }
    });
  }

  public getDateFormatted(absence : AbsenceExtraInfoInterface) : string {
    const dates = absence.absenceDate.split('T')[0];
    const datesSplitted = dates.split('-');
    return `${datesSplitted[2]}-${datesSplitted[1]}-${datesSplitted[0]}`;
  }
  public showSnackbar(message : string) : void {

  }
}
