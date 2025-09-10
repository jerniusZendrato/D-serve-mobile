import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { AuthdataService } from '../service/authdata.service';

@Injectable({
  providedIn: 'root'
})
export class PushNotificationService {
  private vapidPublicKey = '';
  private userId = '';

  constructor(private authService: AuthdataService) {}

  async initialize() {
    // Auto get userId from authData
    const authData = await this.authService.loadAuthData();
    if (!authData?.user?.id) {
      throw new Error('User not authenticated');
    }
    
    this.userId = authData.user.id;
    
    if (Capacitor.isNativePlatform()) {
      await this.initializeNative();
    } else {
      await this.initializeWeb();
    }
  }

  private async initializeNative() {
    const permStatus = await PushNotifications.requestPermissions();
    
    if (permStatus.receive === 'granted') {
      await PushNotifications.register();
    }

    PushNotifications.addListener('registration', (token: Token) => {
      this.subscribeToBackend(token.value);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
      console.log('Push received: ', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification: ActionPerformed) => {
      console.log('Push action performed: ', notification);
    });
  }

  private async initializeWeb() {
    if (!('serviceWorker' in navigator)) return;
    
    await navigator.serviceWorker.register('/push-sw.js');
    this.vapidPublicKey = await this.getVapidPublicKey();
    
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await this.subscribeWeb();
    }
  }

  private async getVapidPublicKey(): Promise<string> {
    const res = await fetch('/api/notifications/vapid-public-key');
    const json = await res.json();
    return json.publicKey || '';
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(new ArrayBuffer(rawData.length));
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  private async subscribeWeb() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) return;

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: this.urlBase64ToUint8Array(this.vapidPublicKey)
    });

    await this.subscribeToBackend(JSON.stringify(subscription));
  }

  private async subscribeToBackend(token: string) {
    await fetch(`/api/notifications/subscribe?userId=${encodeURIComponent(this.userId)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: token
    });
  }

  async unsubscribe() {
    if (Capacitor.isNativePlatform()) {
      await PushNotifications.removeAllListeners();
    } else {
      const registration = await navigator.serviceWorker.getRegistration();
      const subscription = await registration?.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        await fetch(`/api/notifications/subscribe?userId=${encodeURIComponent(this.userId)}&endpoint=${encodeURIComponent(subscription.endpoint)}`, {
          method: 'DELETE'
        });
      }
    }
  }

  async sendTestNotification(title: string = 'Test Order', body: string = 'Ada pesanan baru untuk tambang') {
    const response = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: this.userId,
        title,
        body,
        data: { url: '/' }
      })
    });
    return await response.text();
  }
}
