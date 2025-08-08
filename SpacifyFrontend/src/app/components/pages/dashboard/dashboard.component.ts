import { Component, OnInit } from '@angular/core';
import { Unsubscribe } from '../../../helpers/unsubscribe.class';
import { AuthService } from '../../../services/auth.service';
import { takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { WorkstationReservationService } from '../../../services/workstation-reservation.service';
import { WorkstationReservationResponse } from '../../../models/response/workstation-reservation-response';
import { CreateWorkstationReservationRequest } from '../../../models/request/create-workstation-reservation-request';
import { ModifyWorkstationReservationRequest } from '../../../models/request/modify-workstation-reservation-request';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent extends Unsubscribe implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router,
    private workstationResService: WorkstationReservationService
  ) {
    super();
  }
  ngOnInit(): void {
    const user = this.authService.userSignal();
    if (user != undefined) {
      this.currentUser = user ?? null;
    }
  }

  currentUser: User | null = null;

  refreshAction() {
    this.authService
      .refreshToken()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (res) => {
          console.log('To jest error /refresh-token', res);
        },
      });
  }

  logoutAction() {
    this.authService
      .logoutUser()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {},
        error: (res) => {
          console.log(res);
        },
      });
  }

  getUserInformation() {
    console.log(this.currentUser);
  }

  getReservations() {
    this.workstationResService
      .GetWorkstationReservationsByFloorAndDate(8, new Date('2025-05-27'))
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error(err) {
          console.log(err);
        },
      });
  }
}
