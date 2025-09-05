import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { CommonModule } from '@angular/common';
import { LoadingSpinnerComponent } from './shared/loading-spinner/loading-spinner.component';
// app.component.ts

import { Capacitor } from '@capacitor/core';
import { NotificationService } from './service/notification.service';
import { App } from '@capacitor/app';
import { LoadingService } from './service/loading.service';
import { ToastService } from './service/toast.service';
import { PushAutoInitService } from './services/push-auto-init.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, LoadingSpinnerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Mmonitoring_tambang';
  items: string[] = [];
  isPulling = false;     // indikator sedang menarik
  isLoading = false;     // indikator sedang loading
  private startY = 0;
  private threshold = 200; // minimal jarak tarik untuk trigger
  
  constructor(
    private notificationService: NotificationService, 
    private router: Router, 
    private loadingService: LoadingService,
    public toastService: ToastService,
    private pushAutoInit: PushAutoInitService) {}

ngOnInit() {
  this.loadData();
  if (Capacitor.isNativePlatform()) {
      this.notificationService.init();
    }

  // Auto-enable push notifications
  this.pushAutoInit.autoEnablePushNotifications();

  const container = document.getElementById('scrollable');

  if (container) {
    // Sentuh awal
    container.addEventListener('touchstart', (e) => {
      if (container.scrollTop === 0 && !this.isLoading) {
        this.startY = e.touches[0].clientY;
      }
    });

    // Gerakan tarik
    container.addEventListener('touchmove', (e) => {
      const deltaY = e.touches[0].clientY - this.startY;
      if (container.scrollTop === 0 && deltaY > this.threshold && !this.isLoading) {
        this.isPulling = true;
      }
    });

    // Lepas tarik
    container.addEventListener('touchend', () => {
      if (this.isPulling && !this.isLoading) {
        this.isPulling = false;
        this.isLoading = true; // mulai loading
        this.refreshData();
      }
    });
  }

  App.addListener('backButton', () => {
      // Periksa apakah pengguna berada di halaman utama (root).
      // Anda bisa menentukan halaman utama dengan path-nya, misal '/home'.
      if (this.router.url === '/home') {
        // Tampilkan notifikasi atau dialog konfirmasi.
        // Di sini kita akan menggunakan fungsi window.confirm sebagai contoh sederhana.
        if (window.confirm('Apakah Anda yakin ingin keluar dari aplikasi?')) {
          App.exitApp();
        }
      } else {
        // Jika tidak di halaman utama, kembali ke halaman sebelumnya.
        // Capacitor secara otomatis menangani ini dengan history.back().
        window.history.back();
      }
    });
}

loadData() {
  this.items = Array.from({ length: 20 }, (_, i) => `Item ${i + 1}`);
}

refreshData() {
  console.log('Refreshing data...');
  // simulasi API call
   this.loadingService.show(); 
  setTimeout(() => {
    this.loadData();
     window.location.reload();
    this.isLoading = false; // selesai loading
    this.loadingService.hide(); 
    console.log('Data refreshed!');
  }, 1500);
}

}
