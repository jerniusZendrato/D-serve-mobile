import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { LoadingService } from '../../service/loading.service';

@Component({
  selector: 'app-loading-spinner',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.css'
})
export class LoadingSpinnerComponent {
  constructor(public loadingService: LoadingService) {}
  size: number = 40; // default diameter
  color: string = '#4F46E5'; // default indigo-600
}
