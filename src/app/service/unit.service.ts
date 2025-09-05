import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { map, Observable } from 'rxjs';
import { ApiResponse, ApiResponseunittypes, units, unitType, UnitTypeResponse } from '../models/units.model';
import { LoginService } from './login.service';
import { LoginData } from '../models/login.model';
import { AuthdataService } from './authdata.service';

@Injectable({
  providedIn: 'root'
})
export class UnitService {


  private baseUrl = environment.apiUrl;
  authData: LoginData | null = null;

  constructor(
    private http: HttpClient,
    private loginService: LoginService,
    private authdataservice: AuthdataService
  ) { }

  async getUnits(): Promise<Observable<units[]>> {

  this.authData =await this.loginService.getToken()

  const token = this.authData?.accessToken // atau dari service auth
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
    return this.http.get<ApiResponse>(`${this.baseUrl}/units`, { headers }).pipe(
      map(response => {
        if (response.isSuccess && response.data && response.data.units) {
          // Solusi: Pastikan Anda mengembalikan array 'units'
          return response.data.units;
        }
        // Jika tidak, kembalikan array kosong agar tipe datanya tetap konsisten
        return [];
      })
    );
  }


async getunittypes(): Promise<Observable<unitType[]>> {

  this.authData =await this.authdataservice.loadAuthData()

  const token = this.authData?.accessToken // atau dari service auth
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });
  console.log("ini headers",token)
    return this.http.get<ApiResponseunittypes>(`${this.baseUrl}/unit-types`, { headers }).pipe(
      map(response => {
        if ( response.data['unit-types']) {
          // Solusi: Pastikan Anda mengembalikan array 'units'
          console.log('response.data[unit-types]',response.data['unit-types'])
          return response.data['unit-types'];
        }
        // Jika tidak, kembalikan array kosong agar tipe datanya tetap konsisten
        return [];
      })
    );
  }
}
