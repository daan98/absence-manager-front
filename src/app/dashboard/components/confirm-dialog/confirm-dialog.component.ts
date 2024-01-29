import { Component, Inject, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AbsenceExtraInfoInterface } from '../../interfaces';
import { MaterialModule } from '../../../material/material.module';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MaterialModule],
  templateUrl: './confirm-dialog.component.html',
  styles: ``
})
export class ConfirmDialogComponent {
  private dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  public year  ?: number;
  public month ?: number;
  public day   ?: number;

  
  constructor( @Inject(MAT_DIALOG_DATA) public data : AbsenceExtraInfoInterface ) { 
    this.year                                     = new Date(data.absenceDate).getFullYear();
    this.month                                    = new Date(data.absenceDate).getMonth() + 1;
    this.day                                      = new Date(data.absenceDate).getDate();
  }

  public onClickConfirm() : void {
    this.dialogRef.close(true);
  }

  public onClickCancel() : void {
    this.dialogRef.close(false);
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
}
