import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { LoginData } from '../models/login.model';
import { Preferences } from '@capacitor/preferences';
import { Capacitor } from '@capacitor/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-card.component.html',
  styleUrl: './user-card.component.css'
})
export class UserCardComponent implements OnInit{
  constructor(
  
    ){}
    
    data2: LoginData | null = null;   // variabel untuk simpan data auth
  
    async ngOnInit() {
      await this.loadAuthData();
    }

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
  }


  

}
