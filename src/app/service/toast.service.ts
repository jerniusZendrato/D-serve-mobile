import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';




export interface Toast {
  message: string;
  type: 'success' | 'error' | 'info';
}

@Injectable({
  providedIn: 'root'
})

export class ToastService {

  constructor() { }

  private toastSubject = new BehaviorSubject<Toast | null>(null);
  toast$ = this.toastSubject.asObservable();

  show(message: string, type: 'success' | 'error' | 'info' = 'info') {
    this.toastSubject.next({ message, type });

    // auto-hide setelah 3 detik
    setTimeout(() => this.hide(), 3000);
  }

  hide() {
    this.toastSubject.next(null);
  }
}
