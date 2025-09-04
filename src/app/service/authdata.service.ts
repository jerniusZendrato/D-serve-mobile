import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';
import { LoginData } from '../models/login.model';
import { supports } from '../models/orderan.model';

@Injectable({
  providedIn: 'root'
})
export class AuthdataService {
  data2: LoginData | null = null;   // variabel untuk simpan data auth
  datalok: string | null = null;
  dataacceptedOrders: supports [] = [];
  // acceptedOrders: AcceptedOrder[] = [];


  
  constructor() { }

  async loadAuthData() {
    const platform = Capacitor.getPlatform();
    let authDataString: string | null = null;

    if (platform === 'ios' || platform === 'android') {
      const { value } = await Preferences.get({ key: 'authData' });
      authDataString = value;
    } else {
      authDataString = localStorage.getItem('authData');
    }

    if (authDataString) {
      try {
        this.data2 = JSON.parse(authDataString);
        console.log('Auth Data:', this.data2);
      } catch (e) {
        console.error('Gagal parse authData:', e);
        this.data2 = null;
      }
    }
  return this.data2
  }


  async loadAuthlocation() {
    const platform = Capacitor.getPlatform();
    let authlocationString: string | null = null;

    if (platform === 'ios' || platform === 'android') {
      const { value } = await Preferences.get({ key: 'locationData' });
      authlocationString = value;
    } else {
      authlocationString = localStorage.getItem('locationData');
    }

    if (authlocationString) {
      try {
        this.datalok = authlocationString;
        console.log('Auth Data:', this.datalok);
      } catch (e) {
        console.error('Gagal parse locationData:', e);
        this.datalok = null;
      }
    }
  return this.datalok
  }
  async loadauthacceptedOrders(){
    const platform = Capacitor.getPlatform();
    let authacceptedOrdersString: string | null = null;
    if (platform === 'ios' || platform === 'android') {
      const { value } = await Preferences.get({ key: 'acceptedOrders' });
      authacceptedOrdersString = value;
    } else {
      authacceptedOrdersString = localStorage.getItem('acceptedOrders');
    }

    if (authacceptedOrdersString) {
      try {
        this.dataacceptedOrders = JSON.parse(authacceptedOrdersString);
        console.log('Auth Data:', this.dataacceptedOrders);
      } catch (e) {
        console.error('Gagal parse authData:', e);
        this.dataacceptedOrders = [];
      }
    }
  return this.dataacceptedOrders
  }

}
