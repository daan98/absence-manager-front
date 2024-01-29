import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of } from 'rxjs';
import { environment } from '../../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { AppBackUrlEnum } from '../enum';
import { AbsenceExtraInfoInterface, AbsenceInterface, CreateAbsenceInterface, ProofInterface, SubjectInterface, UserInterface } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl : string = environment.baseUrl;
  private http = inject( HttpClient );
  constructor() { }

  // Absence endpoints
  public createAbsence(body : CreateAbsenceInterface) : Observable<AbsenceInterface> {
    return this.http.post<AbsenceInterface>(`${this.baseUrl}${AppBackUrlEnum.absence}`, body);
  }

  public getAbsencesExtraInfo() : Observable<AbsenceExtraInfoInterface[]> {
    return this.http.get<AbsenceExtraInfoInterface[]>(`${this.baseUrl}${AppBackUrlEnum.absenceExtraInfo}`);
  }

  public getAbsence(id : string) : Observable<AbsenceExtraInfoInterface> {
    return this.http.get<AbsenceExtraInfoInterface>(`${this.baseUrl}${AppBackUrlEnum.absence}/${id}`);
  }

  public deleteAbsence(id : string) : Observable<boolean> {
    return this.http.delete(`${this.baseUrl}${AppBackUrlEnum.absence}/${id}`)
      .pipe(
        map((response) => {return true}),
        catchError(error => { return of(false) })
      );
  }

  public getAbsenceByDate(date : string) : Observable<AbsenceExtraInfoInterface[]> {
    return this.http.get<AbsenceExtraInfoInterface[]>(`${this.baseUrl}${AppBackUrlEnum.absenceByDate}?absenceDate=${date}`);
  }

  public updateAbsece(body : CreateAbsenceInterface, id : string) : Observable<AbsenceInterface> {
    return this.http.patch<AbsenceInterface>(`${this.baseUrl}${AppBackUrlEnum.absence}/${id}`, body)
  }

  // Proof endpoints
  public getProofs() :Observable<ProofInterface[]> {
    return this.http.get<ProofInterface[]>(`${this.baseUrl}${AppBackUrlEnum.proof}`);
  }

  // Subject endpoint
  public getSubjects() : Observable<SubjectInterface[]> {
    return this.http.get<SubjectInterface[]>(`${this.baseUrl}${AppBackUrlEnum.subject}`);
  }

  public getSubjectByName(name : string, limit : number) : Observable<SubjectInterface[]> {
    return this.http.get<SubjectInterface[]>(`${this.baseUrl}${AppBackUrlEnum.subjectName}?name=${name}&limit=${limit}`);
  }

  // User endpoints
  public getSuggestedUser(name : string, limit : number) : Observable<UserInterface[]> {
    return this.http.get<UserInterface[]>(`${this.baseUrl}${AppBackUrlEnum.suggestedUser}?name=${name}&limit=${limit}`);
  }

  public getUserByDni(dni : number) : Observable<UserInterface[]> {
    return this.http.get<UserInterface[]>(`${this.baseUrl}${AppBackUrlEnum.dniUser}?dni=${dni}`);
  }
}
