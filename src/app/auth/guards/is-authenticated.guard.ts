import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthFrontUrlEnum, AuthStatusEnum, LocalStorageItemEnum } from '../enum';
import { tap } from 'rxjs';
import { LocalStorageService } from '../../local-storage.service';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService         = inject( AuthService );
  const router              = inject( Router );
  const localStorageService = inject( LocalStorageService );
  const url                 = state.url;
  console.log('url: ', url);

  localStorage.setItem(LocalStorageItemEnum.url, url);

  console.log('authStatus is authenticated: ', authService.authStatus());
  if(authService.authStatus() === AuthStatusEnum.authenticated) {
    console.log('first');
    return true;
  }

  router.navigateByUrl( AuthFrontUrlEnum.login );
  console.log('second');
  return false;
};


export const AuthGuardCanMatch: CanMatchFn = (route, state) => {
  const router       = inject(Router);
  const authService = inject( AuthService );

  return authService.checkAuthStatus()
    .pipe(
      tap((isAuthenticated) => {
        if(!isAuthenticated) {
          router.navigate(["./auth/login"]);
        }
      })
    );
}