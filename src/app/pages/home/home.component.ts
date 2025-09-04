import { Component, HostListener, OnInit } from '@angular/core';
import { HeaderComponent } from '../../header/header.component';
import { CommonModule } from '@angular/common';
import { IconmenuComponent } from '../../iconmenu/iconmenu.component';
import { UserCardComponent } from '../../user-card/user-card.component';
import { CardPesananComponent } from '../../card-pesanan/card-pesanan.component';
import { FormsModule } from '@angular/forms';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { ToastService } from '../../service/toast.service';
import { AuthdataService } from '../../service/authdata.service';
import { TrackingMapComponent } from '../../tracking-map/tracking-map.component';

@Component({
  selector: 'app-home',
  standalone:true,
  imports: [CommonModule, IconmenuComponent,UserCardComponent,CardPesananComponent, FormsModule,TrackingMapComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit{
  
  constructor(
    private toastService: ToastService,
    private authdataService: AuthdataService,

  ){}
  selectedLocation: string = ''; // default kosong

  async ngOnInit() {
    const savedLocation = await this.authdataService.loadAuthlocation();
  this.selectedLocation = savedLocation || ''; // kalau null/undefined pakai ''
    
  }

  


 async simpanlokasi(lokasi: string | null) {
  if (!lokasi) {
    this.toastService.show('Lokasi tidak ditemukan!', 'error');
    return;
  }

  // ubah object lokasi jadi string sederhana
  // misalnya: "lat,long"
  const locationString = `${lokasi}`;

  const platform = Capacitor.getPlatform();
  if (platform === 'ios' || platform === 'android') {
    await Preferences.set({ 
      key: 'locationData', 
      value: locationString   // simpan sebagai string
    });
  } else {
    localStorage.setItem('locationData', locationString);
  }
}


  locations = [
    { id: 'lt1', name: 'Cendana Puncak (Lt. 1)' },
    { id: 'lt2', name: 'Cendana Puncak (Lt. 2)' },
    { id: 'lt3', name: 'Cendana Puncak (Lt. 3)' },
    { id: 'gunung', name: 'Gunung belah / Jalan melorong' },
    { id: 'lowwall', name: 'Lowwall' },
    { id: 'bottom', name: 'Cendana bottom' },
    { id: 'ambalat', name: 'Ambalat' }
  ];

}
