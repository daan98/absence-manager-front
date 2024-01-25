import { Component, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';
import ToolbarItemInterface from '../../../shared/interface/toolbar-item.interface';
import { AuthService } from '../../../auth/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [ CommonModule, RouterModule, MaterialModule ],
  templateUrl: './dashboard-layout.component.html',
  styles: ``
})
export class DashboardLayoutComponent {

  public authService = inject( AuthService );
  public authUser    = computed(() => this.authService.currentUser() );
  public toolbarItems : Array<ToolbarItemInterface> = [
    { label: 'Todas las faltas', icon: 'list', url: '/dashboard/lista' },
    { label: 'Buscar falta', icon: 'search', url: '/dashboard/buscar' },
    { label: 'Crear', icon: 'add', url: '/dashboard/nueava-falta'}
  ];

  public logout() {
    this.authService.logout();
  }
}
