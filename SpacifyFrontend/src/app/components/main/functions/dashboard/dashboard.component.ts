import { Component, OnInit } from '@angular/core';
import { Unsubscribe } from '../../../../helpers/unsubscribe.class';
import { AuthService } from '../../../../services/auth.service';
import { takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../../../models/user';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent extends Unsubscribe implements OnInit {
  constructor(public authService: AuthService, private router: Router) {
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

  getConferenceAction() {
    this.authService
      .getConferenceRoom()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (res) => {
          console.log('To jest error /conferencerooms', res);
        },
      });
  }

  getWorkstation() {
    this.authService
      .getWorkstations()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          console.log(res);
        },
        error: (res) => {
          console.log('To jest error /workstations', res);
        },
      });
  }
}
