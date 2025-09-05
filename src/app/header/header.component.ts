import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { PesanService } from '../service/pesan.service';
import { AuthdataService } from '../service/authdata.service';
import { LoadingService } from '../service/loading.service';
import { ToastService } from '../service/toast.service';
import { LoginData } from '../models/login.model';
import { WebsoketService } from '../service/websoket.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../service/notification.service';

@Component({
  selector: 'app-header',
  standalone:true,
  imports: [RouterModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit {

  private wsSubscription: Subscription | null = null;

  constructor(
    private router: Router,
    private pesanservice:PesanService,
    private authdataservice: AuthdataService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private websocketService: WebsoketService,
    private notificationService: NotificationService,
  ) {}

  

  ngOnInit(): void {
    // subscribe ke shared notifCount
    this.loadOrderanbyunittype()

     this.pesanservice.orderanChangednotif$.subscribe(() => {
    this.loadOrderanbyunittype(); // refresh otomatis
  });

    this.wsSubscription = this.websocketService.messages$.subscribe(msg => {
      if (!msg) return;

      console.log('Pesan WebSocket masuk di component:', msg);
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      if (isMobile) {
            this.notificationService.sendNotification(
            'Ada pesan baru!',
            `Pesanan "${msg.support.targetUnitTypeName}", oleh user "${msg.support.requesterUserName}"!`
          );
          
          } else {
            // Desktop / Web: bisa pakai console atau toast
            console.log(`Pesanan ${msg.support.targetUnitTypeName}, oleh user ${msg.support.requesterUserName} !`);
          }
          this.toastService.show('Ada Orderan baru masuk!', 'success');

          console.log(`Pesanan "${msg.support.targetUnitTypeName}", oleh user "${msg.support.requesterUserName}"!`);
        

      // Trigger fungsi ambil data terbaru
      this.loadOrderanbyunittype()

    });
    
  }

  toggleNotifikasi() {
    const currentUrl = this.router.url;

    if (currentUrl.includes('/home/notifikasi')) {
      // jika sudah di notifikasi, balik ke dashboard
      this.router.navigate(['/home']);
    } else {
      // jika di halaman lain, pergi ke notifikasi
      this.router.navigate(['/home/notifikasi']);
    }
  }

  logout() {
  // hapus session/localStorage jika ada
  localStorage.removeItem('authData'); 
  this.router.navigate(['/login']); // navigasi SPA
}

notifCount: number = 0;
authData: LoginData | null = null;


async loadOrderanbyunittype() {
    console.log("cek")

    this.authData =await this.authdataservice.loadAuthData()

    const idunittype = this.authData?.user.unit?.unitType.id
    const token = this.authData?.accessToken

     if(idunittype && token){
    this.pesanservice.getOrderanByunittype(idunittype, token).subscribe({
    next: (res) => {
      console.log("res", res)
       if (res.data.supports) {
      this.notifCount = res.data.supports.length? res.data.supports.length: 0 ; // ini sudah array

    }
    },
    error: (err) => {
      console.error("Gagal ambil orderan:", err);
      if (err.status === 401) {
        // hapus token biar tidak dipakai lagi
        // localStorage.removeItem('token');
        // localStorage.removeItem('user');

        // redirect ke login
        this.router.navigate(['//verifikasi']);
      }
    }
  });
  }

  }



}
