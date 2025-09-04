import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  standalone: true,
  imports: [ CommonModule],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.css'
})
export class SplashScreenComponent implements OnInit {
  constructor(private router: Router) {}
  // showSplash = true;

  ngOnInit() {
    setTimeout(() => {
      // this.router.navigateByUrl('/home');
      this.router.navigate(['/home']);
    }, 3000);
  }
}
