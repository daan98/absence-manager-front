import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { AuthService } from './auth/services/auth.service';
import { AuthFrontUrlEnum, AuthStatusEnum, LocalStorageItemEnum } from './auth/enum';
import { LocalStorageService } from './local-storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private authService         = inject( AuthService );
  private router              = inject( Router );
  private localStorageService = inject( LocalStorageService )
  
  public finishedAuthCheck = computed<boolean>(() => {
    if(this.authService.authStatus() === AuthStatusEnum.checking) {
      return false;
    }

    return true;
  });

  public authStatusChangedEffect = effect(() => {
    switch(this.authService.authStatus()) {
      case AuthStatusEnum.checking:
      break;

      case AuthStatusEnum.authenticated:
        const url = localStorage.getItem(LocalStorageItemEnum.url) ? localStorage.getItem(LocalStorageItemEnum.url) : AuthFrontUrlEnum.dashboard;

        if(url) {
          this.router.navigateByUrl(url);
        }

        this.router.navigateByUrl(AuthFrontUrlEnum.dashboard);
      break;

      case AuthStatusEnum.notAuthenticated:
        this.router.navigateByUrl(AuthFrontUrlEnum.login);
      break;

      default:
        this.router.navigateByUrl(AuthFrontUrlEnum.login);
      break
    }
  });
}
