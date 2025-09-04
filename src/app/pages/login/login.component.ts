import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { Login } from '../../models/login.model';
import { LoadingService } from '../../service/loading.service';
import { ToastService } from '../../service/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  username: string = '';
  password: string = '';

  // dataname: string = 'admin';
  // datapass: string = '123'

  
  constructor(private router: Router, 
    private loginservice:LoginService, 
    private loadingService: LoadingService,
    private toastService: ToastService) {}
  onLogin() {
    const loginData: Login = {
      username: this.username,
      password: this.password
    };
    this.loadingService.show(); 
    

    this.loginservice.postData(loginData).subscribe({
      next: async (res) => {
             
              this.router.navigate(['/home']);
              this.loadingService.hide();
          },
      error: (err) => {
        // alert('Username dan password belum sesuai!');
        this.toastService.show('Username dan password belum sesuai!', 'error');
        this.loadingService.hide(); 
        console.error('Login gagal:', err);       // sebelumnya [object Object]
        console.error('Status:', err.status);    // status HTTP
        console.error('Body:', err.error);       // body response dari backend
      }
    });
    setTimeout(() => {
  this.loadingService.hide();
}, 1000); // 2000 ms = 2 detik


    console.log('Login dengan:', this.username, this.password);
    // TODO: panggil API login di sini
    
    
  }





  

  // onLogin() {
  //   if (!this.username || !this.password) {
  //     alert('Username dan password harus diisi!');
  //     return;
  //   }
  //   if (this.username !=this.dataname || this.password != this.datapass) {
  //     alert('Username dan password belum sesuai!');
  //     return;
  //   }
  //   if(this.username === this.dataname && this.password === this.datapass ){
  //     this.router.navigateByUrl('/home');
  //   }
  //   console.log('Login dengan:', this.username, this.password);
  //   // TODO: panggil API login di sini
  // }
}
