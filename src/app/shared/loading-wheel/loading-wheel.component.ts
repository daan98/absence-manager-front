import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  selector: 'shared-loading-wheel',
  standalone: true,
  imports: [ CommonModule ],
  templateUrl: './loading-wheel.component.html',
  styleUrl: './loading-wheel.component.scss'
})
export class LoadingWheelComponent {

}
