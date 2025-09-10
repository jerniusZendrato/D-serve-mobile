import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LoginService } from '../../service/login.service';
import { Login } from '../../models/login.model';
import { LoadingService } from '../../service/loading.service';
import { ToastService } from '../../service/toast.service';
import { PushService } from '../../service/push-notification.service';
import { AuthdataService } from '../../service/authdata.service';

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
    private toastService: ToastService,
    private pushService: PushService,
    private authdataservice: AuthdataService) {}
  onLogin() {
    const loginData: Login = {
      username: this.username,
      password: this.password
    };
    this.loadingService.show(); 
    

    this.loginservice.postData(loginData).subscribe({
      next: async (res) => {
              // Initialize push notifications setelah login berhasil dengan delay
              setTimeout(async () => {
                try {
                  console.log('🔄 Starting push notification initialization...');
                  // Ambil JWT token dari response atau storage
                  const authData = await this.authdataservice.loadAuthData();
                  const jwt = authData?.accessToken;
                  
                  if (jwt) {
                    await this.pushService.init(jwt);
                    console.log('✅ Push notifications initialized after login');
                  } else {
                    console.warn('⚠️ No JWT token found for push notifications');
                  }
                } catch (error) {
                  console.error('❌ Failed to initialize push notifications:', error);
                }
              }, 2000); // Delay 2 detik untuk memastikan authData tersimpan
              
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
