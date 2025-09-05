// notification.service.ts

import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { LocalNotifications, Channel } from '@capacitor/local-notifications';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private isInitialized = false;

  constructor() {
    // Constructor tidak lagi memanggil metode async.
    // Metode init() akan dipanggil dari AppComponent.
  }

  /**
   * Menginisialisasi service notifikasi. Meminta izin dan membuat channel notifikasi.
   * Harus dipanggil sekali, idealnya saat aplikasi dimulai.
   */
  public async init() {
    if (Capacitor.getPlatform() === 'web') {
      console.log('Running on web: local notifications are not available.');
      return;
    }

    try {
      // Meminta izin notifikasi.
      const perm = await LocalNotifications.requestPermissions();
      if (perm.display !== 'granted') {
        console.warn('Notification permissions not granted.');
        this.isInitialized = false;
        return;
      }

      // Membuat channel notifikasi untuk Android 8+
      const channel: Channel = {
        id: 'default',
        name: 'Default Channel',
        importance: 5,
        description: 'Channel for order notifications'
      };
      await LocalNotifications.createChannel(channel);

      this.isInitialized = true;
      console.log('NotificationService is ready.');
    } catch (err) {
      console.error('Failed to initialize notifications:', err);
    }
  }

  /**
   * Mengirim notifikasi lokal.
   *
   * @param title Judul notifikasi.
   * @param body Isi notifikasi.
   */
  public async sendNotification(title: string, body: string) {
    if (Capacitor.getPlatform() === 'web') {
      console.log(`Web notification: ${title} - ${body}`);
      return;
    }

    if (!this.isInitialized) {
      console.warn('NotificationService is not ready. Please initialize first.');
      return;
    }

    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title,
            body,
            id: Math.floor(Math.random() * 10000000), 
            // Jadwalkan 1 detik dari sekarang untuk memastikan notifikasi diproses.
            schedule: { at: new Date(Date.now() + 1000) },
            channelId: 'default'
          }
        ]
      });
      console.log('Notification scheduled successfully!');
    } catch (err) {
      console.error('Failed to send notification:', err);
    }
  }
}