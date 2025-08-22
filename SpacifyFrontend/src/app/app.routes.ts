import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { authenticationGuard } from './guards/authentication.guard';
import { blockAccessToLogRegGuard } from './guards/block-access-to-log-reg.guard';
import { WorkspaceReservationsComponent } from './components/pages//workspace-reservations/workspace-reservations.component';
import { DashboardLayoutComponent } from './components/layout/dashboard-layout.component';
import { ConferenceRoomReservationComponent } from './components/pages/conference-room-reservation/conference-room-reservation.component';
import { AdminComponent } from './components/pages/admin/admin.component';
import { SettingsComponent } from './components/pages/settings/settings.component';
import { adminGuard } from './guards/admin.guard';
import { roleGuard } from './guards/role.guard';
import { UserRole } from './enums/user-role.enum';
import { MyReservationsComponent } from './components/pages/my-reservations/my-reservations.component';

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
    path: '',
    component: DashboardLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        component: DashboardComponent,
        title: 'Spacify | Panel Główny',
        canActivate: [authenticationGuard],
      },
      {
        path: 'workstation-reservation',
        component: WorkspaceReservationsComponent,
        title: 'Spacify | Rezerwacja stanowiska',
        canActivate: [authenticationGuard],
      },
      {
        path: 'conferenceroom-reservation',
        component: ConferenceRoomReservationComponent,
        title: 'Spacify | Rezerwacja sali',
        canActivate: [
          authenticationGuard,
          roleGuard([UserRole.Administrator, UserRole.Leader]),
        ],
      },
      {
        path: 'my-reservations',
        component: MyReservationsComponent,
        title: 'Spacify | Moje rezerwacje',
        canActivate: [authenticationGuard],
      },
      {
        path: 'admin',
        component: AdminComponent,
        title: 'Spacify | Panel administracyjny',
        canActivate: [authenticationGuard, roleGuard([UserRole.Administrator])],
      },
      {
        path: 'settings',
        component: SettingsComponent,
        title: 'Spacify | Ustawienia',
        canActivate: [authenticationGuard],
      },
    ],
  },
  { path: 'forbidden', component: ErrorPageComponent },
  { path: '**', component: ErrorPageComponent },
];
