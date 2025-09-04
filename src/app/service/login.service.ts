import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { LoginResponse, Login, LoginData  } from '../models/login.model';
import { Capacitor } from '@capacitor/core';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root'
})
export class LoginService {

  private baseUrl = environment.apiUrl; // ganti sesuai URL backend
  constructor(private http: HttpClient) {}

  // Contoh GET
  postData(endpoint: Login): Observable<LoginResponse> {
    // return this.http.get(`${this.baseUrl}/${endpoint}`);
    // return this.http.post<Login>(`${this.baseUrl}/auth/login`, endpoint);
    return new Observable((observer) => {
      this.http.post<LoginResponse>(`${this.baseUrl}/auth/login`, endpoint)
        .subscribe({
           next: async (res) => {
          // const LoginData = res?.data;

          const LoginData: LoginData  = {
              ...res.data};

          if (!LoginData) {
            observer.error('Token tidak ditemukan di response');
            return;
          }
          const platform = Capacitor.getPlatform();
          if (platform === 'ios' || platform === 'android') {
            await Preferences.set({ 
              key: 'authData', 
              value: JSON.stringify(LoginData)  // simpan seluruh data dalam bentuk string
            });
          } else {
            localStorage.setItem('authData', JSON.stringify(LoginData));
          }
          observer.next(res);
          observer.complete();
        },
          error: (err) => observer.error(err)
        });
    });

  }

  async getToken(): Promise<LoginData  | null> {
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
      // const authData = JSON.parse(authDataString);
      const authData: LoginData = JSON.parse(authDataString); // ← casting ke LoginData

      return authData || null;
    } catch (e) {
      console.error('Failed to parse authData:', e);
      return null;
    }
  }

  return null;
}


  // Contoh POST
  // postData(endpoint: string, payload: any): Observable<any> {
  //   return this.http.post(`${this.baseUrl}/${endpoint}`, payload);
  // }

  putUnit(userId: string, unitId: string, token:string, authData: LoginData): Observable<any> {
    const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
    const url = `${this.baseUrl}/users/${userId}/unit`;
    const body = { unitId: unitId };

    console.log('Mengirim permintaan PUT ke:', url);
    console.log('Dengan body:', body);

    return this.http.put(url, body,{headers}).pipe(
    map(async (res: any) => {
      // Ambil data dari response PUT
      const responseData = res.data ?? {};

      // Format agar tetap sesuai authData lama (user di dalam object)
      const updatedAuthData: LoginData = {
        ...authData,
        user: responseData,  // ganti user lama dengan response data
        // timestamp: res.timestamp ?? new Date().toISOString()
      };

      console.log("Updated authData:", updatedAuthData);

      const platform = Capacitor.getPlatform();
      if (platform === 'ios' || platform === 'android') {
        await Preferences.set({
          key: 'authData',
          value: JSON.stringify(updatedAuthData)
        });
      } else {
        localStorage.setItem('authData', JSON.stringify(updatedAuthData));
      }

      return res;
    })
  );

  }
}
