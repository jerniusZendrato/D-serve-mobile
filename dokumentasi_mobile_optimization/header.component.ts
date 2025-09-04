import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent {
  isMobileMenuOpen = false;

  constructor(private router: Router) {}

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Prevent body scroll when menu is open
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  toggleNotifikasi(): void {
    // Existing notification logic
    console.log('Toggle notifications');
  }

  logout(): void {
    // Existing logout logic
    this.closeMobileMenu();
    this.router.navigate(['/login']);
  }

  // Close mobile menu when clicking outside or on route change
  ngOnDestroy(): void {
    document.body.style.overflow = 'auto';
  }
}
