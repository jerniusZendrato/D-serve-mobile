import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PesanService } from '../../service/pesan.service';
import { supports } from '../../models/orderan.model';
import { AuthdataService } from '../../service/authdata.service';
import { LoginData } from '../../models/login.model';
import { ToastService } from '../../service/toast.service';
import { LoadingService } from '../../service/loading.service';
import { WebsoketService } from '../../service/websoket.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-notifications',
  standalone:true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.css'
})


export class NotificationsComponent implements OnInit {
  notifications: any[] = [];

  constructor(
    private router: Router,
    private pesanservice:PesanService,
    private authdataservice: AuthdataService,
    private loadingService: LoadingService,
    private websocketService: WebsoketService,
    private toastService: ToastService,
  ) { }

  
  orderanList: supports[] = [];
  authData: LoginData | null = null;
  private wsSubscription: Subscription | null = null;

  ngOnInit(): void {
    // Contoh data notifikasi
    console.log("ngonit")
    this.loadOrderanbyunittype()

    this.wsSubscription = this.websocketService.messages$.subscribe(msg => {
      if (!msg) return;
        this.loadOrderanbyunittype()
          });

  }

  async postAccepted(idsupport: string) {

    this.authData =await this.authdataservice.loadAuthData()
    const idunit = this.authData?.user.unit?.id
    const token = this.authData?.accessToken

    const dataAccepted={
    supportId : idsupport ?? '',
    responderUnitId : idunit ?? '',
  }
    this.loadingService.show();
    this.pesanservice.postAcceptedpesanan(dataAccepted, token?? '').subscribe({
    next: (res) => {
      this.toastService.show('Accepted berhasil dibuat!', 'success');
     
      this.loadOrderanbyunittype()
      this.pesanservice.notifyOrderanChangedNotif();
      this.router.navigate(['/home'])
    },
    error: (err) => {
      this.toastService.show('Gagal Accepted, orderan sudah tidak ada', 'error');
      this.loadOrderanbyunittype()
    }
    });

    setTimeout(() => {
        this.loadingService.hide();
      }, 1000);


  }




  goBack() {
    this.router.navigate(['/home']); // kembali ke dashboard
  }


  
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
      this.orderanList = res.data.supports; // ini sudah array
      console.log("orderanList:",this.orderanList)
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