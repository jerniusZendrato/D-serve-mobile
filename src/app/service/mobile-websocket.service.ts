import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { AuthdataService } from './authdata.service';
import { PesanService } from './pesan.service';
import { LoginData } from '../models/login.model';

@Injectable({
  providedIn: 'root'
})
export class MobileWebsocketService implements OnDestroy {

  private messagesSubject = new BehaviorSubject<any>(null);
  public messages$ = this.messagesSubject.asObservable();

  private supportSubject = new BehaviorSubject<any>(null);
  public support$ = this.supportSubject.asObservable();

  private pollingSubscription: Subscription | null = null;
  private lastCheckTime: Date = new Date();
  authData: LoginData | null = null;

  constructor(
    private authdataservice: AuthdataService,
    private pesanservice: PesanService
  ) {
    this.initializeMobileService();
  }

  private async initializeMobileService() {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'ios' || platform === 'android') {
      // Mobile: gunakan polling sebagai pengganti WebSocket
      this.startPolling();
      console.log('🔄 Mobile WebSocket service started with polling');
    } else {
      // Web: fallback ke WebSocket normal jika diperlukan
      console.log('🌐 Web platform detected, use regular WebSocket service');
    }
  }

  private startPolling() {
    // Polling setiap 5 detik untuk cek update
    this.pollingSubscription = interval(5000).subscribe(async () => {
      await this.checkForUpdates();
    });
  }

  private async checkForUpdates() {
    try {
      this.authData = await this.authdataservice.loadAuthData();
      
      if (!this.authData) return;

      const unitTypeId = this.authData.user.unit?.unitType.id;
      const token = this.authData.accessToken;

      if (unitTypeId && token) {
        // Cek update untuk help requests
        this.pesanservice.getOrderanByunittype(unitTypeId, token).subscribe({
          next: (res) => {
            if (res.data.supports) {
              // Simulasi WebSocket message untuk help requests
              const mockMessage = {
                type: 'help-request-update',
                data: res.data.supports,
                timestamp: new Date()
              };
              this.messagesSubject.next(mockMessage);
            }
          },
          error: (err) => {
            console.warn('Error polling help requests:', err);
          }
        });

        // Cek update untuk user orders (support updates)
        const userId = this.authData.user.id;
        if (userId) {
          // Implementasi polling untuk support updates bisa ditambahkan di sini
          // Misalnya dengan endpoint khusus untuk cek update berdasarkan timestamp
        }
      }
    } catch (error) {
      console.warn('Error during polling:', error);
    }
  }

  // Method compatibility dengan WebSocket service
  getSupportUpdates() {
    return this.support$;
  }

  subscribeToSupport(supportId: string) {
    console.log(`📱 Mobile: Simulating subscription to support ${supportId}`);
    // Di mobile, ini bisa di-handle dengan polling atau push notification
  }

  // Method untuk trigger manual update
  triggerUpdate() {
    this.checkForUpdates();
  }

  ngOnDestroy(): void {
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
  }
}