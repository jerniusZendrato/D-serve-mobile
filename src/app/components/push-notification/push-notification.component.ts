import { Component, OnInit } from '@angular/core';
import { PushNotificationService } from '../../services/push-notification.service';
import { AuthdataService } from '../../service/authdata.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-push-notification',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="push-container">
      <h2>Push Notifications</h2>
      
      <div class="user-info" *ngIf="currentUser">
        <p><strong>User:</strong> {{currentUser.username}} ({{currentUser.id}})</p>
        <p><strong>Role:</strong> {{currentUser.role}}</p>
      </div>
      
      <div class="buttons">
        <button (click)="subscribe()" [disabled]="!currentUser">Subscribe</button>
        <button (click)="unsubscribe()">Unsubscribe</button>
      </div>
      
      <div class="test-section">
        <h3>Test Notification</h3>
        <div class="form-group">
          <label>Title</label>
          <input [(ngModel)]="testTitle" />
        </div>
        <div class="form-group">
          <label>Message</label>
          <input [(ngModel)]="testBody" />
        </div>
        <button (click)="sendTest()">Send Test</button>
      </div>
      
      <div class="log" *ngIf="logs.length">
        <h3>Logs</h3>
        <div *ngFor="let log of logs" class="log-entry">{{log}}</div>
      </div>
    </div>
  `,
  styles: [`
    .push-container { padding: 20px; max-width: 500px; }
    .user-info { background: #f8f9fa; padding: 12px; border-radius: 4px; margin: 12px 0; }
    .form-group { margin: 12px 0; }
    label { display: block; margin-bottom: 4px; font-weight: bold; }
    input { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .buttons { margin: 16px 0; }
    button { margin-right: 8px; padding: 8px 16px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
    button:disabled { background: #ccc; cursor: not-allowed; }
    .test-section { margin-top: 24px; padding-top: 24px; border-top: 1px solid #eee; }
    .log { margin-top: 24px; }
    .log-entry { background: #f8f9fa; padding: 8px; margin: 4px 0; border-radius: 4px; font-family: monospace; font-size: 12px; }
  `]
})
export class PushNotificationComponent implements OnInit {
  currentUser: any = null;
  testTitle = 'Pesanan Baru';
  testBody = 'Ada pesanan baru untuk tambang Anda';
  logs: string[] = [];

  constructor(
    private pushService: PushNotificationService,
    private authService: AuthdataService
  ) {}

  async ngOnInit() {
    const authData = await this.authService.loadAuthData();
    this.currentUser = authData?.user;
  }

  async subscribe() {
    try {
      await this.pushService.initialize();
      this.log('Berhasil subscribe push notification');
    } catch (error) {
      this.log('Gagal subscribe: ' + error);
    }
  }

  async unsubscribe() {
    try {
      await this.pushService.unsubscribe();
      this.log('Berhasil unsubscribe');
    } catch (error) {
      this.log('Gagal unsubscribe: ' + error);
    }
  }

  async sendTest() {
    try {
      const result = await this.pushService.sendTestNotification(this.testTitle, this.testBody);
      this.log('Test notification sent: ' + result);
    } catch (error) {
      this.log('Gagal kirim test: ' + error);
    }
  }

  private log(message: string) {
    this.logs.unshift(`${new Date().toISOString()} ${message}`);
    if (this.logs.length > 10) this.logs.pop();
  }
}
