import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, map, retry, throwError, of, Subscription } from 'rxjs';
import { CheckTokenInterface, LoginResponseInterface, UserInterface } from '../interfaces';
import { environment } from '../../../environments/environments';
import { AuthStatusEnum, AuthUrlEnum, LocalStorageItemEnum } from '../enum';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private readonly baseUrl : string = environment.baseUrl;
  private http                      = inject(HttpClient);

  private _currentUser              = signal<UserInterface | null>(null);
  private _authStatus               = signal<AuthStatusEnum>(AuthStatusEnum.checking);

  public currentUser                = computed(() => this._currentUser());
  public authStatus                 = computed(() => this._authStatus());
  constructor() { }

  private setAuthentication(user : UserInterface, token : string) : boolean {
    this._currentUser.set(user);
    this._authStatus.set(AuthStatusEnum.authenticated);
    localStorage.setItem(LocalStorageItemEnum.token, token);
    return true;
  }

  public login(dni : number, password : string) : Observable<boolean> {
    const url : string = `${this.baseUrl}${AuthUrlEnum.login}`;
    const body = { dni, password };
    return this.http.post<LoginResponseInterface>(url, body)
      .pipe(
        map( ({ user, token }) => this.setAuthentication(user, token) ),
        catchError( (errorMessage) => throwError(() => errorMessage.error.message) ),
      );
  }

  public checkAuthStatus() : Observable<boolean> {
    const url     = `${this.baseUrl}${AuthUrlEnum.checkToken}`;
    const token   = localStorage.getItem(LocalStorageItemEnum.token);
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    if(!token)  {
      throwError(() => 'Token no encontrado. Por favor inicia sesión con una cuenta valida');
      // LLAMAR A LOGOUT
      return of(false);
    }

    return this.http.get<CheckTokenInterface>(url, { headers })
      .pipe(
        map(({ user, token }) => this.setAuthentication(user, token) ),
        catchError(() => {
          this._authStatus.set(AuthStatusEnum.notAuthenticated);
          throwError(() => 'No estás autenticado.');
          return of(false);
        })
      );
  }

  public logout() {
    localStorage.removeItem(LocalStorageItemEnum.token);
    localStorage.removeItem(LocalStorageItemEnum.url);
    this._currentUser.set(null);
    this._authStatus.set(AuthStatusEnum.notAuthenticated);
  }

  public changePassword(newPassword : string, user : UserInterface) : Observable<UserInterface> {
    return this.http.patch<UserInterface>(`${this.baseUrl}${AuthUrlEnum.user}/${user._id}`, newPassword);
  }

  public getUserByDni(dni : string) : Observable<UserInterface[]> {
    return this.http.get<UserInterface[]>(`${this.baseUrl}${AuthUrlEnum.dni}?dni=`);
  }
}
