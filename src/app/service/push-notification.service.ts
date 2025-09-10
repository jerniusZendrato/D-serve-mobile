import { Injectable, inject } from '@angular/core';
import { PushNotifications, Token, PushNotificationSchema, ActionPerformed } from '@capacitor/push-notifications';
import { LocalNotifications } from '@capacitor/local-notifications';
import { FirebaseMessaging } from '@capacitor-firebase/messaging';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PushService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private lastKnownToken = '';

  async init(jwt: string) {
    console.log('🚀 Initializing push notifications...');
    console.log('📱 Platform:', Capacitor.getPlatform());
    console.log('🔑 JWT Token available:', !!jwt);

    try {
      // 1) Push Notifications Permissions
      const perm = await PushNotifications.checkPermissions();
      if (perm.receive !== 'granted') {
        const result = await PushNotifications.requestPermissions();
        if (result.receive !== 'granted') {
          console.log('❌ Push notification permission denied');
          return;
        }
      }
      
      // 2) Local Notifications Permissions (untuk foreground notifications)
      const localPerm = await LocalNotifications.checkPermissions();
      if (localPerm.display !== 'granted') {
        const localResult = await LocalNotifications.requestPermissions();
        console.log('🔔 Local notifications permission:', localResult.display);
      }

      // 3) Register for push (OS-level)
      await PushNotifications.register();

      // 4) Get cross-platform FCM token
      //    For Android: FCM is default. For iOS: Firebase-messaging bridges APNs → FCM token.
      const { token } = await FirebaseMessaging.getToken();
      console.log('🎩 FCM Token received:', token?.substring(0, 20) + '...');

      if (token) {
        this.lastKnownToken = token;
        // 5) Send token to backend
        await this.registerToken(jwt, token);
      }

      // 6) Handle token refresh
      FirebaseMessaging.addListener('tokenReceived', async (event) => {
        console.log('🔄 Token refreshed:', event.token?.substring(0, 20) + '...');
        if (event.token) {
          this.lastKnownToken = event.token;
          await this.registerToken(jwt, event.token);
        }
      });

      // 7) Foreground notifications (app open)
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('📨 Foreground notification received:', notification);
        // Optionally show in-app UI or route immediately
        // Read notification.data for deep link context
        this.handleForegroundNotification(notification);
      });

      // 8) Tapped notifications (from background/terminated)
      PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
        console.log('👆 Notification tapped:', action);
        const data: any = action.notification?.data || {};
        this.openFromNotificationData(data);
      });

      // 9) Firebase Messaging listeners (untuk mengatasi log error)
      FirebaseMessaging.addListener('notificationReceived', (notification) => {
        console.log('📨 Firebase notification received:', JSON.stringify(notification, null, 2));
        this.handleForegroundNotification(notification as any);
      });

      FirebaseMessaging.addListener('notificationActionPerformed', (action) => {
        console.log('👆 Firebase notification tapped:', JSON.stringify(action, null, 2));
        const data = action.notification?.data || {};
        this.openFromNotificationData(data);
      });

      // 10) Local Notifications listeners (untuk mengatasi log error)
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('📨 Local notification received:', JSON.stringify(notification, null, 2));
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        console.log('👆 Local notification tapped:', JSON.stringify(action, null, 2));
      });

      console.log('🎉 ✅ PUSH NOTIFICATIONS INITIALIZED SUCCESSFULLY!');
      console.log('🔔 Status: READY TO RECEIVE NOTIFICATIONS');
      
      // Expose service to window for manual testing
      (window as any).pushService = this;

    } catch (error) {
      console.error('❌ Error initializing push notifications:', error);
    }
  }

  private async registerToken(jwt: string, token: string) {
    if (!token) return;
    console.log("ini tokennya :",token),
    console.log(" ini platformnya :",this.detectPlatform())
    try {
      console.log('🚀 Registering device token to backend...');
      
      const response = await this.http.post(`${environment.apiUrl}/notifications/devices`, {
        token,
        platform: this.detectPlatform(),
        // deviceModel: navigator.userAgent,
        appVersion: '1.0.0',
        locale: 'id-ID'
      }, { 
        headers: { Authorization: `Bearer ${jwt}` } 
      }).toPromise();

      console.log('🎉 ✅ DEVICE TOKEN REGISTERED SUCCESSFULLY!');
      console.log('📱 Platform:', this.detectPlatform());
      console.log('🎩 Token:', token.substring(0, 20) + '...');
      console.log('💬 Backend Response:', response);
      
    } catch (error) {
      console.error('❌ Error registering token:', error);
    }
  }

  private detectPlatform() {
    // Simple heuristic; native layer/platform APIs may be used if desired
    const platform = Capacitor.getPlatform();
    if (platform === 'android') return 'ANDROID';
    if (platform === 'ios') return 'IOS';
    return /android/i.test(navigator.userAgent) ? 'ANDROID' : 'IOS';
  }

  private async handleForegroundNotification(notification: any) {
    console.log('📨 Handling foreground notification:', notification);
    
    // Extract notification data
    const title = notification.notification?.title || notification.title || 'New Notification';
    const body = notification.notification?.body || notification.body || 'You have a new message';
    const data = notification.notification?.data || notification.data || {};
    
    console.log('🔔 Showing foreground notification:', { title, body, data });
    
    try {
      // Show local notification saat app foreground
      await LocalNotifications.schedule({
        notifications: [
          {
            title: title,
            body: body,
            id: Date.now(),
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: data
          }
        ]
      });
      
      console.log('✅ Foreground notification displayed');
      
      // Handle specific notification types
      if (data.type === 'SUPPORT_CREATED') {
        console.log('🆕 New support request received:', data);
      }
      
    } catch (error) {
      console.error('❌ Error showing foreground notification:', error);
    }
  }

  openFromNotificationData(data: any) {
    console.log('🔗 Opening from notification data:', data);
    
    // Example deep-link handling; adapt to your router
    // Prefer server payload `data.url` or `data.supportId`
    const url = data?.url || (data?.supportId ? `/supports/${data.supportId}` : '/home');
    
    console.log('🎯 Navigating to:', url);
    // Implement your router navigation here
    this.router.navigateByUrl(url);
  }

  async cleanupTokenOnLogout(jwt: string, lastKnownToken?: string) {
    const tokenToDelete = lastKnownToken || this.lastKnownToken;
    if (!tokenToDelete) return;
    
    try {
      console.log('🧹 Cleaning up token on logout...');
      
      await this.http.delete(`${environment.apiUrl}/notifications/device-token`, {
        params: { token: tokenToDelete },
        headers: { Authorization: `Bearer ${jwt}` }
      }).toPromise();
      
      console.log('✅ Token cleanup successful');
      this.lastKnownToken = '';
      
    } catch (error) {
      console.error('❌ Error cleaning up token:', error);
    }
  }

  // Method untuk get last known token (untuk logout)
  getLastKnownToken(): string {
    return this.lastKnownToken;
  }

  // Method untuk test local notification (simulasi)
  async sendTestLocalNotification() {
    try {
      await LocalNotifications.schedule({
        notifications: [
          {
            title: 'Test Notification',
            body: 'Ini adalah test notification lokal',
            id: Date.now(),
            schedule: { at: new Date(Date.now() + 1000) }, // 1 detik dari sekarang
            sound: 'default',
            attachments: undefined,
            actionTypeId: '',
            extra: { data: 'test' }
          }
        ]
      });
      console.log('✅ Test local notification scheduled');
    } catch (error) {
      console.error('❌ Error scheduling local notification:', error);
    }
  }

  // Method untuk request backend send push notification
  async requestTestPushNotification(jwt: string) {
    if (!this.lastKnownToken) {
      console.error('❌ No FCM token available');
      return;
    }

    try {
      console.log('🚀 Requesting test push notification from backend...');
      
      const response = await this.http.post(`${environment.apiUrl}/notifications/test-push`, {
        token: this.lastKnownToken,
        title: 'Test Push Notification',
        body: 'Ini adalah test push notification dari backend',
        data: {
          type: 'TEST',
          url: '/home'
        }
      }, { 
        headers: { Authorization: `Bearer ${jwt}` } 
      }).toPromise();

      console.log('✅ Test push notification requested:', response);
      
    } catch (error) {
      console.error('❌ Error requesting test push:', error);
    }
  }

  // Method untuk setup listeners early (tanpa JWT)
  async setupListeners() {
    try {
      console.log('🔊 Setting up push notification listeners...');
      
      // Firebase Messaging listeners
      FirebaseMessaging.addListener('notificationReceived', (notification) => {
        console.log('📨 Firebase notification received:', JSON.stringify(notification, null, 2));
        this.handleForegroundNotification(notification as any);
      });

      FirebaseMessaging.addListener('notificationActionPerformed', (action) => {
        console.log('👆 Firebase notification tapped:', JSON.stringify(action, null, 2));
        const data = action.notification?.data || {};
        this.openFromNotificationData(data);
      });

      // Push Notifications listeners
      PushNotifications.addListener('pushNotificationReceived', (notification: PushNotificationSchema) => {
        console.log('📨 Push notification received:', JSON.stringify(notification, null, 2));
        this.handleForegroundNotification(notification);
      });

      PushNotifications.addListener('pushNotificationActionPerformed', (action: ActionPerformed) => {
        console.log('👆 Push notification tapped:', JSON.stringify(action, null, 2));
        const data: any = action.notification?.data || {};
        this.openFromNotificationData(data);
      });

      // Local Notifications listeners
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        console.log('📨 Local notification received:', JSON.stringify(notification, null, 2));
      });

      LocalNotifications.addListener('localNotificationActionPerformed', (action) => {
        console.log('👆 Local notification tapped:', JSON.stringify(action, null, 2));
      });

      console.log('✅ All notification listeners setup complete');
      
    } catch (error) {
      console.error('❌ Error setting up listeners:', error);
    }
  }

  // Method untuk check status
  getStatus() {
    return {
      platform: Capacitor.getPlatform(),
      hasToken: !!this.lastKnownToken,
      tokenPreview: this.lastKnownToken ? this.lastKnownToken.substring(0, 20) + '...' : 'None'
    };
  }
}