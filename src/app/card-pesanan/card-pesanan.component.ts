import { Component, OnInit, OnDestroy } from '@angular/core';
import { PesananService   } from '../service/pesanan.service';
import { CommonModule } from '@angular/common';
import {  supports } from '../models/orderan.model';
import { LoginData } from '../models/login.model';
import { AuthdataService } from '../service/authdata.service';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../service/toast.service';
import { PesanService } from '../service/pesan.service';
import { LoadingService } from '../service/loading.service';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { WebsoketService } from '../service/websoket.service';
import { Subscription } from 'rxjs';
import { NotificationService } from '../service/notification.service';

@Component({
  selector: 'app-card-pesanan',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './card-pesanan.component.html',
  styleUrl: './card-pesanan.component.css'
})
export class CardPesananComponent implements OnInit, OnDestroy {
  orders: any[] = [];

  
    steps = ['Dipesan', 'Diproses', 'Dikirim', 'Selesai'];

  constructor(private pesananService: PesananService,
    private authdataservice: AuthdataService,
    private router: Router,
    private toastService: ToastService,
    private loadingService: LoadingService,
    private websocketService: WebsoketService,
    private notificationService: NotificationService,
    private pesanservice: PesanService
  ) {}

  expandedIndex: number | null = null;
  private wsSubscription: Subscription | null = null;
  

  toggleExpand(idx: number) {
    // jika card yang diklik sudah terbuka → tutup
    // jika card lain atau belum terbuka → buka card itu
    if (this.expandedIndex === idx) {
      this.expandedIndex = null;
    } else {
      this.expandedIndex = idx;
    }
  }

  isExpanded(idx: number): boolean {
    return this.expandedIndex === idx;
  }

  orderanList: supports[] = [];
  authData: LoginData | null = null;

  ngOnInit() {
    this.pesananService.orderanChanged$.subscribe(() => {
      this.loadOrderanDetail();
    });
    
    this.loadOrderanDetail();
    
    // Setup WebSocket subscription
    this.setupWebSocketSubscription();
  }

  private setupWebSocketSubscription() {
    console.log('Setting up WebSocket subscription...');
    
    // Subscribe ke support updates
    this.wsSubscription = this.websocketService.getSupportUpdates().subscribe(msg => {
      if (!msg) return;
      
      console.log('Pesan WebSocket masuk di component:', msg);
      this.handleWebSocketMessage(msg);
      this.loadOrderanDetail();
    });
    
    // Fallback subscription
    this.websocketService.messages$.subscribe(msg => {
      if (!msg) return;
      console.log('Fallback message dari WebSocket:', msg);
      this.loadOrderanDetail();
    });
    
    // Manual subscription setelah delay
    setTimeout(() => {
      this.subscribeToCurrentOrders();
    }, 2000);
  }
  
  private handleWebSocketMessage(msg: any) {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Safe access dengan null check
    const supportData = msg.support || {};
    const targetUnitTypeName = supportData.targetUnitTypeName || 'Unknown';
    const responderUserName = supportData.responderUserName || 'System';
    
    if (isMobile) {
      this.notificationService.sendNotification(
        'Ada update pesanan!',
        `Pesanan "${targetUnitTypeName}" telah di-update oleh "${responderUserName}"!`
      );
    } else {
      console.log(`Orderan ${targetUnitTypeName} telah di-update oleh ${responderUserName}!`);
    }
    
    this.toastService.show('Pesanan telah di-update!', 'info');
  }
  
  private async subscribeToCurrentOrders() {
    const platform = Capacitor.getPlatform();
    let acceptedOrdersData: string | null = null;
    
    if (platform === 'ios' || platform === 'android') {
      const result = await Preferences.get({ key: 'acceptedOrders' });
      acceptedOrdersData = result.value;
    } else {
      acceptedOrdersData = localStorage.getItem('acceptedOrders');
    }
    
    if (acceptedOrdersData) {
      try {
        const orders = JSON.parse(acceptedOrdersData);
        console.log('Manual subscribe untuk orders:', orders.length);
        
        orders.forEach((order: any) => {
          this.websocketService.subscribeToSupport(order.id);
        });
      } catch (error) {
        console.error('Error parsing accepted orders:', error);
      }
    }
  }

  
  
  
  
  async loadOrderanDetail() {

  this.authData =await this.authdataservice.loadAuthData()
  if(this.authData){
    const iduser = this.authData?.user.id
    const token = this.authData?.accessToken
    if(iduser && token){

      this.pesananService.getOrderanByUser(iduser, token).subscribe({
    next: (res) => {
       if (res.isSuccess && res.data) {
        console.log('Data orderan:', res.data.supports);
      this.orderanList = res.data.supports; // ini sudah array

      const acceptedOrders = this.orderanList.filter(order => order.status === 'PROSESS'|| order.status === 'ACCEPTED');

      const platform = Capacitor.getPlatform();
      const acceptedOrdersString = JSON.stringify(acceptedOrders);

      if (platform === 'ios' || platform === 'android') {
        Preferences.set({ key: 'acceptedOrders', value: acceptedOrdersString });
      } else {
        localStorage.setItem('acceptedOrders', acceptedOrdersString);
      }
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
    else{
      console.warn(`Orderan dengan ID ${iduser} tidak ditemukan`);
    }
  }


}
async completeddata(idsupport: string){
    this.authData =await this.authdataservice.loadAuthData()
    const token = this.authData?.accessToken

    const status = {
    status: "completed"
    }
    this.loadingService.show();



    this.pesanservice.postCompketedpesanan(status,idsupport, token?? '').subscribe({
      next: (res) => {
      this.toastService.show('Accepted berhasil dibuat!', 'success');
     
      this.loadOrderanDetail()
    },
    error: (err) => {
      this.toastService.show('Gagal Accepted, orderan sudah tidak ada', 'error');
      // if (err.status === 401) {
      //   // hapus token biar tidak dipakai lagi
      //   // localStorage.removeItem('token');
      //   // localStorage.removeItem('user');

      //   // redirect ke login
      //   this.router.navigate(['//verifikasi']);
      // }
      this.loadOrderanDetail()
    }
    });
    setTimeout(() => {
        this.loadingService.hide();
      }, 1000);

  }


  ngOnDestroy() {
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
  }

// async postAccepted(idsupport: string) {

//     this.authData =await this.authdataservice.loadAuthData()
//     const idunit = this.authData?.user.unit?.id
//     const token = this.authData?.accessToken

//     const dataAccepted={
//     supportId : idsupport ?? '',
//     responderUnitId : idunit ?? '',
//   }
//     this.loadingService.show();
//     this.pesanservice.postAcceptedpesanan(dataAccepted, token?? '').subscribe({
//     next: (res) => {
//       this.toastService.show('Accepted berhasil dibuat!', 'success');
     
//       this.loadOrderanbyunittype()
//       this.router.navigate(['/home'])
//     },
//     error: (err) => {
//       this.toastService.show('Gagal Accepted, orderan sudah tidak ada', 'error');
//       this.loadOrderanbyunittype()
//     }
//     });

//     setTimeout(() => {
//         this.loadingService.hide();
//       }, 1000);


//   }



}
