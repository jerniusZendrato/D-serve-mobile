import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, from, map, Observable, of, Subject, switchMap, throwError } from 'rxjs';
import { LoginData } from '../models/login.model';
import { environment } from '../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HelpRequestsResponse,postoderan } from '../models/orderan.model';
import { AuthdataService } from './authdata.service';

@Injectable({
  providedIn: 'root'
})
export class PesananService {

  datalogin: LoginData | null = null; 
  private baseUrl = environment.apiUrl;
  authData: LoginData | null = null;

  constructor(
    private http: HttpClient,
    private authdataservice: AuthdataService
  ) { }
  
  postDatapesanan(endpoint: postoderan |null, token: string): Observable<any> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json'
  });
  console.log("endpoint data pesaan",endpoint)
  console.log("endpoint data token",token)

  // langsung return dari HttpClient (lebih clean)
  return this.http.post<any>(`${this.baseUrl}/support/requests`, endpoint, { headers });
}











  private ordersSubject = new BehaviorSubject<any[]>([]);
  orders$ = this.ordersSubject.asObservable();

  addOrder(name: string, id: string|null, menukomen: string, iduser: string| undefined, accessToken: string| undefined) {
    const current = this.ordersSubject.getValue();
    this.ordersSubject.next([
      ...current,
      { name, status: `Pesanan ${name} sedang dikirim, tunggu konfirmasi` }
    ]);
  }


  

getOrderanByUser(userId: string, token: string): Observable<HelpRequestsResponse> {
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.get<HelpRequestsResponse>(
    `${this.baseUrl}/support?userId=${userId}`,
    { headers }
  );
}

private orderanChanged = new Subject<void>(); // 🔔 event refresh
orderanChanged$ = this.orderanChanged.asObservable(); 
notifyOrderanChanged() {
    this.orderanChanged.next();
  }






}
