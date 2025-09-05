import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '../service/login.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = async (route, state) => {
  const loginservice = inject(LoginService);
  const router = inject(Router);

  // const token = await loginservice.getToken();

  const authData = await loginservice.getToken(); // return LoginData | null


  if (!authData) {
    console.log("ini isi token: ",authData)
    // Kalau token kosong → redirect ke login
    router.navigate(['/login']);
    return false;
  }
  // if (authData ){
  //   const loginTime = new Date(authData.timestamp).getTime();
  //   const now = new Date().getTime(); 

  //   const ONE_DAY_MS = 24 * 60 * 60 * 1000; // 1 hari dalam milidetik
  //   console.log(loginTime -now, ONE_DAY_MS)

  //   // if (now - loginTime > ONE_DAY_MS) {
  //   if (now - loginTime > ONE_DAY_MS) {
  //   console.log("Login sudah lebih dari 1 hari, perlu login ulang");
    
  //   router.navigate(['/verifikasi']);
  //   return false;
  // } else {
  //   console.log("Token masih valid");
  //   return true;
  // }

  // }
  return true;
};
