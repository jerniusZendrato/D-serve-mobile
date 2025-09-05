import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { LoginService } from '../service/login.service';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoginData } from '../models/login.model';
import { environment } from '../../environments/environment';
import { CommonModule } from '@angular/common';
import { LoadingService } from '../service/loading.service';
import { ToastService } from '../service/toast.service';
import { PesanService } from '../service/pesan.service';

@Component({
  selector: 'app-verify-password',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule ],
  templateUrl: './verify-password.component.html',
  styleUrl: './verify-password.component.css'
})
export class VerifyPasswordComponent implements OnInit{

  async ngOnInit() {

    this.showToastMessage('Data user tidak ditemukan. Silakan login ulang.');
    }


  verifyForm: FormGroup;
  authData: LoginData | null = null;
  errorMsg: string = '';
  toastMsg: string = '';
  showToast: boolean = false;
  toastType: 'success' | 'error' | 'info' = 'error';
  closable: boolean = true;

  private baseUrl = environment.apiUrl;
  

  constructor(
    private fb: FormBuilder,
    private loginService: LoginService,
    private http: HttpClient,
    private router: Router,
    private loadingservice: LoadingService,
    private toastService: ToastService,
    private pesanservice: PesanService
  ){
    this.verifyForm = this.fb.group({
      password: ['', [Validators.required]]
      });

     this.loadAuthData();
  }

  async loadAuthData() {
    this.authData = await this.loginService.getToken();
  }

  async onSubmit() {
    this.loadingservice.show();
    if (!this.authData) {
      this.errorMsg = 'Data user tidak ditemukan, silakan login ulang';
      return;
    }

    if (this.verifyForm.invalid) {
      this.errorMsg = 'Password harus diisi';
      return;
    }

    const payload = {
      username: this.authData.user.username,
      password: this.verifyForm.value.password
    };

    
    try {
      const res: any = await this.http.post(`${this.baseUrl}/auth/login`, payload).toPromise();
      
      this.loginService.postData(payload).subscribe({
      next: async (res) => {
        
        this.router.navigate(['/home']);
        this.loadingservice.hide();
          },
      error: (err) => {
        // alert('Username dan password belum sesuai!');
        this.toastService.show('password belum sesuai!', 'error');
        this.loadingservice.hide(); 
        console.error('Login gagal:', err);       // sebelumnya [object Object]
        console.error('Status:', err.status);    // status HTTP
        console.error('Body:', err.error);       // body response dari backend
      }
    });
      // if (res.isSuccess) {
      //   // verifikasi berhasil → lanjut ke halaman berikut
      //   this.router.navigate(['/home']);
      // } else {
      //   this.errorMsg = 'Password salah';
      // }

    } catch (e) {
      console.error(e);
      this.errorMsg = 'Terjadi kesalahan saat verifikasi';
      setTimeout(() => {this.loadingservice.hide();}, 1000); // 2000 ms = 1 detik
      this.router.navigate(['/login'])
    }
  }


  showToastMessage(msg: string) {
    this.toastMsg = msg;
    this.showToast = true;
    setTimeout(() => {
      this.showToast = false;
      this.toastMsg = '';
    }, 4000); // tampil 4 detik
  }
  getToastClass(): string {
  switch (this.toastType) {
    case 'success':
      return 'bg-green-600 text-white';
    case 'error':
      return 'bg-red-600 text-white';
    case 'info':
      return 'bg-blue-600 text-white';
    default:
      return 'bg-gray-800 text-white';
  }
}
closeToast(): void {
  this.showToast = false;
  this.toastMsg = '';
}
}
