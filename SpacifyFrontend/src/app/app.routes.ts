import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/main/functions/dashboard/dashboard.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { authenticationGuard } from './guards/authentication.guard';
import { blockAccessToLogRegGuard } from './guards/block-access-to-log-reg.guard';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [blockAccessToLogRegGuard],
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [blockAccessToLogRegGuard],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authenticationGuard],
  },
  { path: '**', component: ErrorPageComponent },
];
