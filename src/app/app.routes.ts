import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SplashScreenComponent } from './splash-screen/splash-screen.component';
import { HomeComponent } from './pages/home/home.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { HomedashboardComponent } from './pages/homedashboard/homedashboard.component';
import { authGuard } from './guards/auth.guard';
import { VerifyPasswordComponent } from './verify-password/verify-password.component';
import { UnitInputComponent } from './unit-input/unit-input.component';
import { MapsComponent } from './maps/maps.component';

export const routes: Routes = [
      { path: 'splash', component: SplashScreenComponent },
      { path: '', redirectTo: 'splash', pathMatch: 'full' },
      { path: 'verifikasi', component: VerifyPasswordComponent },
      { path: 'login', component: LoginComponent },
      { path: 'orders/maps', component: MapsComponent },
      { 
    path: 'home', 
    component: HomedashboardComponent,canActivate: [authGuard] ,
    children: [
      { path: 'notifikasi', component: NotificationsComponent },
      { path: 'unit', component: UnitInputComponent },
      { path: 'maps', component: MapsComponent },
      { path: '', component: HomeComponent }// default content
    ]
  }

];
