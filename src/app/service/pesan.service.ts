import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { pesanData, SupportsData } from '../models/orderan.model';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PesanService {

  private baseUrl = environment.apiUrl;
  constructor(
    private http: HttpClient,
  ) { }

  getOrderanByunittype(userId: string, token: string): Observable<pesanData> {
    console.log("masuk sini getOrderanByunittype")
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<pesanData>(`${this.baseUrl}/support?targetUnitTypeId=${userId}&status=prosess`,
    { headers }
  );
}

postAcceptedpesanan(dataAccepted: any,  token: string): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  });

  // langsung return dari HttpClient (lebih clean)
  return this.http.post<any>(`${this.baseUrl}/support/responses/accept`, dataAccepted, { headers });
}


postCompketedpesanan(status: any, dataidsupport: string,  token: string): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  console.log("ini stauts",status)

  // langsung return dari HttpClient (lebih clean)
  return this.http.patch<any>(`${this.baseUrl}/support/${dataidsupport}`, status,{ headers });
}



private orderanChangednotif = new Subject<void>(); // 🔔 event refresh
orderanChangednotif$ = this.orderanChangednotif.asObservable(); 
notifyOrderanChangedNotif() {
    this.orderanChangednotif.next();
  }






}
