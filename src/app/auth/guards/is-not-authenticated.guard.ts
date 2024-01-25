import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { AuthFrontUrlEnum, AuthStatusEnum } from '../enum';

export const isNotAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject( AuthService );
  const router      = inject( Router );

  if(authService.authStatus() === AuthStatusEnum.authenticated) {
    router.navigateByUrl( AuthFrontUrlEnum.dashboard );
    return false;
  }

  console.log('authService: ', authService.authStatus());

  return true;
};
