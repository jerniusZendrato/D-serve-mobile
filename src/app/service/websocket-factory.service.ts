import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { WebsoketService } from './websoket.service';
import { MobileWebsocketService } from './mobile-websocket.service';

@Injectable({
  providedIn: 'root'
})
export class WebsocketFactoryService {

  constructor(
    private webSocketService: WebsoketService,
    private mobileWebsocketService: MobileWebsocketService
  ) {}

  getWebSocketService() {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'ios' || platform === 'android') {
      console.log('📱 Using Mobile WebSocket Service');
      return this.mobileWebsocketService;
    } else {
      console.log('🌐 Using Web WebSocket Service');
      return this.webSocketService;
    }
  }

  // Wrapper methods untuk compatibility
  get messages$() {
    return this.getWebSocketService().messages$;
  }

  getSupportUpdates() {
    return this.getWebSocketService().getSupportUpdates();
  }

  subscribeToSupport(supportId: string) {
    return this.getWebSocketService().subscribeToSupport(supportId);
  }
}