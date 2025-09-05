import { Injectable } from '@angular/core';
import { PushNotificationService } from './push-notification.service';
import { AuthdataService } from '../service/authdata.service';

@Injectable({
  providedIn: 'root'
})
export class PushAutoInitService {

  constructor(
    private pushService: PushNotificationService,
    private authService: AuthdataService
  ) {}

  async autoEnablePushNotifications() {
    try {
      const authData = await this.authService.loadAuthData();
      if (authData?.user?.id) {
        await this.pushService.initialize();
        console.log('Push notifications auto-enabled for user:', authData.user.username);
      }
    } catch (error) {
      console.log('Push notifications not enabled:', error);
    }
  }
}
