import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  username: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  constructor(private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  async onLogin(): Promise<void> {
    if (!this.username || !this.password) {
      return;
    }

    this.isLoading = true;

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Your existing login logic here
      console.log('Login attempt:', { username: this.username, password: this.password });
      
      // Navigate to home on success
      this.router.navigate(['/home']);
    } catch (error) {
      console.error('Login error:', error);
      // Handle error (show toast, etc.)
    } finally {
      this.isLoading = false;
    }
  }

  // Handle form validation
  isFormValid(): boolean {
    return this.username.trim().length > 0 && this.password.length > 0;
  }
}
