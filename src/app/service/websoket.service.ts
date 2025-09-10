import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, interval, Subscription } from 'rxjs';
import { Client, IMessage } from '@stomp/stompjs';
import { AuthdataService } from './authdata.service';
import { LoginData } from '../models/login.model';
import { supports } from '../models/orderan.model';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { PesanService } from './pesan.service';

@Injectable({
  providedIn: 'root'
})
export class WebsoketService implements OnDestroy {

  private client: Client | null = null;
  private messagesSubject = new BehaviorSubject<any>(null);
  public messages$ = this.messagesSubject.asObservable();

  private supportSubject = new BehaviorSubject<any>(null);
  public support$ = this.supportSubject.asObservable();

  authData: LoginData | null = null;
  acceptedOrders: supports[] = [];
  private subscribedSupportIds: Set<string> = new Set();
  private storageCheckInterval: any = null;
  private pollingSubscription: Subscription | null = null;
  private isMobile: boolean = false;
  private isAppActive: boolean = true;
  private lastDataHash: string = '';
  private pollingInterval: number = 5000;
  
  constructor(
    private authdataservice: AuthdataService,
    private pesanservice: PesanService
  ) {
    this.isMobile = Capacitor.getPlatform() === 'ios' || Capacitor.getPlatform() === 'android';
    this.setupVisibilityListener();
    this.initializeService();
  }

  private async initializeService() {
    if (this.isMobile) {
      console.log('📱 Trying WebSocket for mobile first...');
      try {
        await this.initializeWebSocket();
      } catch (error) {
        console.log('📱 WebSocket failed, falling back to polling...');
        await this.initializeMobileService();
      }
    } else {
      console.log('🌐 Initializing web service with WebSocket...');
      await this.initializeWebSocket();
    }
  }

  private async initializeWebSocket() {
    return new Promise<void>((resolve, reject) => {
      this.client = new Client({
        brokerURL: 'wss://mining-be-service-staging.up.railway.app/ws',
        reconnectDelay: 3000,
        debug: (str) => console.debug('[STOMP]', str)
      });
      
      let connectionTimeout: any;
      let isResolved = false;
      
      if (this.isMobile) {
        connectionTimeout = setTimeout(() => {
          if (!isResolved) {
            console.log('📱 WebSocket connection timeout, will fallback to polling');
            this.client?.deactivate();
            reject(new Error('WebSocket timeout'));
          }
        }, 15000);
      }

      this.client.onConnect = async () => {
        console.log('✅ Connected to WebSocket successfully!');
        
        if (connectionTimeout) {
          clearTimeout(connectionTimeout);
        }
        if (!isResolved) {
          isResolved = true;
          resolve();
        }

        try {
          this.authData = await this.authdataservice.loadAuthData();
          
          const unitTypeId = this.authData?.user.unit?.unitType.id;
          if (unitTypeId) {
            this.client?.subscribe(`/topic/help-requests/${unitTypeId}`, (msg: IMessage) => {
              const body = JSON.parse(msg.body);
              this.messagesSubject.next(body);
            });
            console.log(`✅ Subscribed to /topic/help-requests/${unitTypeId}`);
          } else {
            console.warn('unitTypeId undefined, tidak subscribe ke topic');
          }

          await this.subscribeToCurrentSupportIds();
          this.startLocalStorageMonitoring();
        } catch (error) {
          console.error('Error saat initialize WebSocket:', error);
        }
      };

      this.client.onStompError = (frame) => {
        console.error('❌ STOMP error:', frame.headers['message'] || '', frame.body || '');
        if (!isResolved && this.isMobile) {
          isResolved = true;
          reject(new Error('STOMP Error'));
        }
      };

      this.client.onWebSocketError = (error) => {
        console.error('❌ WebSocket error:', error);
        if (!isResolved && this.isMobile) {
          isResolved = true;
          reject(new Error('WebSocket Error'));
        }
      };

      this.client.onWebSocketClose = () => {
        console.log('🔌 WebSocket closed');
        if (this.isMobile && !isResolved) {
          isResolved = true;
          reject(new Error('WebSocket Closed'));
        }
      };

      this.client.activate();
      
      if (!this.isMobile) {
        resolve();
      }
    });
  }

  private async initializeMobileService() {
    await this.subscribeToCurrentSupportIds();
    this.startMobilePolling();
    this.startLocalStorageMonitoring();
  }

  private startMobilePolling() {
    this.pollingSubscription = interval(this.pollingInterval).subscribe(async () => {
      if (this.isAppActive) {
        await this.checkMobileUpdates();
      }
    });
    console.log(`Started mobile polling every ${this.pollingInterval/1000} seconds`);
  }

  private async checkMobileUpdates() {
    try {
      this.authData = await this.authdataservice.loadAuthData();
      
      if (!this.authData) return;

      const unitTypeId = this.authData.user.unit?.unitType.id;
      const token = this.authData.accessToken;

      if (unitTypeId && token) {
        this.pesanservice.getOrderanByunittype(unitTypeId, token).subscribe({
          next: (res) => {
            if (res.data.supports) {
              const currentDataHash = JSON.stringify(res.data.supports).length.toString();
              
              if (currentDataHash !== this.lastDataHash) {
                this.lastDataHash = currentDataHash;
                
                if (res.data.supports && res.data.supports.length > 0) {
                  const latestSupport = res.data.supports[0];
                  
                  const mockMessage = {
                    support: {
                      targetUnitTypeName: latestSupport.targetUnitTypeName || 'Unknown',
                      requesterUserName: latestSupport.requesterUserName || 'Unknown',
                      responderUserName: latestSupport.responderUserName || null,
                      id: latestSupport.id,
                      status: latestSupport.status
                    },
                    type: 'help-request-update',
                    timestamp: new Date()
                  };
                  
                  this.messagesSubject.next(mockMessage);
                  console.log('📱 Mobile: Data changed, notifying subscribers');
                }
              }
            }
          },
          error: (err) => {
            console.warn('Mobile polling error:', err);
          }
        });
      }
    } catch (error) {
      console.warn('Error during mobile polling:', error);
    }
  }

  subscribeToSupport(supportId: string) {
    if (this.isMobile && !this.isWebSocketConnected()) {
      console.log(`Mobile: Simulating subscription to support ${supportId}`);
      this.subscribedSupportIds.add(supportId);
    } else if (this.client && this.client.active) {
      this.client.subscribe(`/topic/support/${supportId}`, (msg: IMessage) => {
        const body = JSON.parse(msg.body);
        console.log(`Support update for ${supportId}:`, body);
        this.supportSubject.next(body);
      });
      console.log(`Manually subscribed to /topic/support/${supportId}`);
    }
  }

  private async subscribeToCurrentSupportIds() {
    try {
      const acceptedOrdersData = await this.getAcceptedOrdersFromStorage();
      if (acceptedOrdersData) {
        this.acceptedOrders = JSON.parse(acceptedOrdersData);
        console.log('📊 Accepted orders dari storage:', this.acceptedOrders.length);
        
        if (this.acceptedOrders && this.acceptedOrders.length > 0) {
          const supportIds = this.acceptedOrders.map(order => order.id);
          
          supportIds.forEach(id => {
            if (!this.subscribedSupportIds.has(id)) {
              this.subscribeToSupportId(id);
              this.subscribedSupportIds.add(id);
            }
          });
        }
      }
    } catch (error) {
      console.warn('❌ Error saat load accepted orders:', error);
    }
  }

  private subscribeToSupportId(supportId: string) {
    if (this.client && this.client.active) {
      this.client.subscribe(`/topic/support/${supportId}`, (msg: IMessage) => {
        const body = JSON.parse(msg.body);
        console.log(`📨 Support update untuk ID ${supportId}:`, body);
        this.supportSubject.next(body);
      });
      console.log(`✅ Subscribed to /topic/support/${supportId}`);
    }
  }

  private startLocalStorageMonitoring() {
    this.storageCheckInterval = setInterval(() => {
      if (this.isAppActive) {
        this.checkForNewSupportIds();
      }
    }, 3000);
    
    console.log('🔄 Started localStorage monitoring every 3 seconds...');
  }

  private async checkForNewSupportIds() {
    try {
      const acceptedOrdersData = await this.getAcceptedOrdersFromStorage();
      if (acceptedOrdersData) {
        const currentOrders = JSON.parse(acceptedOrdersData);
        const currentSupportIds = currentOrders.map((order: any) => order.id);
        
        const newIds = currentSupportIds.filter((id: string) => !this.subscribedSupportIds.has(id));
        
        if (newIds.length > 0) {
          console.log(`🆕 Found ${newIds.length} new support IDs:`, newIds);
          
          newIds.forEach((id: string) => {
            this.subscribeToSupportId(id);
            this.subscribedSupportIds.add(id);
          });
        }
      }
    } catch (error) {
      console.warn('❌ Error saat check storage:', error);
    }
  }

  private async getAcceptedOrdersFromStorage(): Promise<string | null> {
    const platform = Capacitor.getPlatform();
    
    if (platform === 'ios' || platform === 'android') {
      const result = await Preferences.get({ key: 'acceptedOrders' });
      return result.value;
    } else {
      return localStorage.getItem('acceptedOrders');
    }
  }

  private setupVisibilityListener() {
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        this.isAppActive = !document.hidden;
      });
    }
  }

  isWebSocketConnected(): boolean {
    return this.client?.active || false;
  }
  
  getConnectionInfo(): string {
    if (this.isWebSocketConnected()) {
      return this.isMobile ? '📱 Mobile WebSocket Connected' : '🌐 Web WebSocket Connected';
    } else {
      return this.isMobile ? '📱 Mobile Polling Mode' : '❌ WebSocket Disconnected';
    }
  }

  checkImmediately() {
    if (this.isWebSocketConnected()) {
      console.log('🚀 WebSocket active, no need for manual check');
    } else if (this.isMobile) {
      console.log('🚀 Immediate check triggered (polling mode)');
      this.checkMobileUpdates();
    }
  }

  getSupportUpdates() {
    return this.support$;
  }

  ngOnDestroy(): void {
    console.log('WebSocketService destroyed, deactivating client');
    
    if (this.storageCheckInterval) {
      clearInterval(this.storageCheckInterval);
    }
    
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
    }
    
    this.client?.deactivate();
  }
}