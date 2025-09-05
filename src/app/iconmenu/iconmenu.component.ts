import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PesananService } from '../service/pesanan.service';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../service/notification.service';
import { units, unitType } from '../models/units.model';
import { UnitService } from '../service/unit.service';
import { AuthdataService } from '../service/authdata.service';
import { LoadingService } from '../service/loading.service';
import { ToastService } from '../service/toast.service';
import { LoginData } from '../models/login.model';

@Component({
  selector: 'app-iconmenu',
  standalone:true,
  imports: [ CommonModule, FormsModule ],
  templateUrl: './iconmenu.component.html',
  styleUrl: './iconmenu.component.css'
})
export class IconmenuComponent implements OnInit{
  router: any;
  dataUser: LoginData | null = null;

  ngOnInit(): void {
      this.fetchUnits()
      this.loadUserData()
          }

  selectedMenuId: string | null = null;
  showModal = false;
  modalMessage = '';
  menuToConfirm: string = '';
  menuToConfirmid: string = '';
  komentar: string = '';

  menus: { id: number; name: string; svg: SafeHtml }[] = [];


  constructor(
    private loadingService: LoadingService, 
    private pesananService: PesananService, 
    private notificationService: NotificationService,
    private unitservice: UnitService,
    private authdataService: AuthdataService,
    private toastService: ToastService) {
      }


  async loadUserData() {
    try {
      // Jangan assign langsung Promise, pakai await
      const user = await this.authdataService.loadAuthData();
      this.dataUser = user;
      console.log('Data user:', this.dataUser);
    } catch (err) {
      console.error('Gagal load data user', err);
      this.dataUser = null;
    }
  }

  availableUnits: unitType[] = [];
    async fetchUnits(): Promise<void> {
      (await this.unitservice.getunittypes()).subscribe({
        next: (units) => {
          // Data berhasil diambil, simpan ke properti availableUnits
          this.availableUnits = units;
          console.log(this.availableUnits)
          console.log('Daftar Unit Tersedia:', this.availableUnits);
        },
        error: (err) => {
          // Tangani error jika terjadi
          console.error('Gagal mengambil data unit types:', err);
        }
      });
    }


  selectMenu(id: string) {
    this.selectedMenuId = id;
    const menu = this.availableUnits.find(m => m.id === id);
    if (menu ) {
      this.menuToConfirm = `${menu.name}`;
      this.menuToConfirmid = `${menu.id}`; 
      this.modalMessage = `Apakah Anda yakin ingin memesan  ${menu.name}?`;
      this.komentar = ''; // reset komentar
      this.showModal = true;
    }
  }

  

 async confirmAction() {
  this.showModal = false;

  const orderName = this.menuToConfirm ;
  const meniid = this.selectedMenuId;
  this.dataUser = await this.authdataService.loadAuthData();
  const datalocation = await this.authdataService.loadAuthlocation();



  const postdata={
    requesterUserId : this.dataUser?.user.id ?? '',
    requesterUnitId : this.dataUser?.user.unit?.id ?? '',
    requestedUnitTypeId: this.menuToConfirmid ?? '',
    description: this.komentar ,
    location: datalocation

  }

  
  // const orderName = this.menuToConfirm + (this.komentar ? ` - "${this.komentar}"` : '');
  if(await this.dataUser && postdata){
    this.loadingService.show();
    // this.pesananService.addOrder(orderName, meniid,this.komentar, this.dataUser?.user.id,this.dataUser?.accessToken );
    this.pesananService.postDatapesanan(postdata,this.dataUser?.accessToken ?? '')
    .subscribe({
      next: async (res) => {
             
              // this.router.navigate(['/home']);
              
              this.pesananService.notifyOrderanChanged();
              this.toastService.show('Order berhasil dibuat!', 'success');
              // alert('Orderan berhasil dibuat!');
              // this.loadingService.hide();
              
          },
      error: (err) => {
        this.toastService.show('Gagal membuat orderan', 'error');
        // this.loadingService.hide(); 
        console.error('Login gagal:', err);       // sebelumnya [object Object]
        console.error('Status:', err.status);    // status HTTP
        console.error('Body:', err.error);       // body response dari backend
         if (err.status === 400 || err.status === 402) {
              this.router.navigate(['/login']);
            }
      }
    });
    setTimeout(() => {
  this.loadingService.hide();
}, 1000); // 2000 ms = 2 detik

  }

  // Tampilkan notifikasi native jika di mobile
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  if (isMobile) {
    this.notificationService.sendNotification(
    'Pesanan Terkirim',
    `Pesanan "${orderName}" berhasil dikirim!`
  );
  } else {
    // Desktop / Web: bisa pakai console atau toast
    console.log(`Pesanan "${orderName}" berhasil dikirim!`);
  }

  console.log(`${orderName} dipesan!`);
}

  cancelAction() {
    this.showModal = false;
  }




  
}
