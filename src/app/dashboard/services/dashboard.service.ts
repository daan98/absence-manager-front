import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { AppBackUrlEnum } from '../enum/app-back-url.enum';
import { AbsenceExtraInfoInterface, UserInterface } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl : string = environment.baseUrl;
  private http = inject( HttpClient );
  constructor() { }

  public getAbsenceExtraInfo() : Observable<AbsenceExtraInfoInterface[]> {
    return this.http.get<AbsenceExtraInfoInterface[]>(`${this.baseUrl}${AppBackUrlEnum.absenceExtraInfo}`);
  }
}
