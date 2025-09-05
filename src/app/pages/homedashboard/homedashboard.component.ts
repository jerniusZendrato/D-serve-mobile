import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-homedashboard',
  standalone:true,
  imports: [RouterModule, HeaderComponent, CommonModule],
  templateUrl: './homedashboard.component.html',
  styleUrl: './homedashboard.component.css'
})
export class HomedashboardComponent {

}
