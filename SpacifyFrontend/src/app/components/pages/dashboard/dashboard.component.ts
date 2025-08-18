import { Component, OnInit } from '@angular/core';
import { Unsubscribe } from '../../../helpers/unsubscribe.class';
import { AuthService } from '../../../services/auth.service';
import { catchError, combineLatest, of, takeUntil } from 'rxjs';
import { Router } from '@angular/router';
import { User } from '../../../models/user';
import { CommonModule } from '@angular/common';
import { WorkstationReservationService } from '../../../services/workstation-reservation.service';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { FloorService } from '../../../services/floor.service';
import { NotificationService } from '../../../services/notification.service';
import { FloorResponse } from '../../../models/response/floor-response';
import { UpcomingReservationDetails } from '../../../models/upcoming-reservation-dashboard-details';
import { ConferenceRoomReservationService } from '../../../services/conference-room-reservation.service';
import { AvailableConfRoomsReservationResponse } from '../../../models/response/Available-conference-rooms-reservation-response';
import { AvailableWorkstationsReservationResponse } from '../../../models/response/Available-workstations-reservation-response';
import { ReservationTimeRangeResponse } from '../../../models/response/reservation-time-range-response';
import { DashboardDataResponse } from '../../../models/response/dashboard-data-response';
import { RouterModule } from '@angular/router';
import { UserRole } from '../../../enums/user-role.enum';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent extends Unsubscribe implements OnInit {
  constructor(
    public authService: AuthService,
    private router: Router,
    private workstationResService: WorkstationReservationService,
    private confRoomResService: ConferenceRoomReservationService,
    private floorService: FloorService,
    private notificationService: NotificationService
  ) {
    super();
  }
  ngOnInit(): void {
    const user = this.authService.userSignal();
    if (user != undefined) {
      this.currentUser = user ?? null;
    }

    this.setDashboardInformations();
  }

  currentUser: User | null = null;

  floorDetails: FloorResponse[] = [];
  upcomingDetail: UpcomingReservationDetails[] = [];
  availableWorkstations: AvailableWorkstationsReservationResponse | null = null;
  availableConfRooms: AvailableConfRoomsReservationResponse | null = null;

  dashboardInformations: {
    icon: string;
    value: string | number;
    label: string;
    type: string;
  }[] = [];

  userRoleEnum = UserRole;

  setDashboardInformations() {
    combineLatest({
      confRooms: this.confRoomResService.getAvailableConfRoomsCount().pipe(
        catchError(() =>
          of({
            availableConfRoomsRes: 0,
            totalConfRoomsRes: 0,
          } as AvailableConfRoomsReservationResponse)
        )
      ),
      workstations: this.workstationResService
        .getAvailableWorkstationCount()
        .pipe(
          catchError(() =>
            of({
              availableWorkstationsRes: 0,
              totalWorkstationsRes: 0,
            } as AvailableWorkstationsReservationResponse)
          )
        ),
      upcomingReservations: this.floorService
        .getUpcomingReservations(3)
        .pipe(catchError(() => of([] as FloorResponse[]))),
      reservationWatch: this.workstationResService
        .getDashboardReservationWatch()
        .pipe(
          catchError(() =>
            of({
              start: new Date(0),
              end: new Date(0),
            } as ReservationTimeRangeResponse)
          )
        ),
    })
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((data: DashboardDataResponse) => {
        this.floorDetails = data.upcomingReservations;
        this.getUpcomingReservationInfo();

        this.dashboardInformations = [
          {
            icon: 'fas fa-chair',
            value: `${data.workstations.availableWorkstationsRes} / ${data.workstations.totalWorkstationsRes}`,
            label: 'Wolne stanowiska',
            type: 'workstationsStats',
          },
          {
            icon: 'fas fa-door-open',
            value: `${data.confRooms.availableConfRoomsRes} / ${data.confRooms.totalConfRoomsRes}`,
            label: 'Wolne sale konferencyjne',
            type: 'confRoomsStats',
          },
          {
            icon: 'fas fa-calendar',
            value: this.upcomingDetail.length,
            label: 'Nadchodzące rezerwacje',
            type: 'upcomingReservationsStats',
          },
          {
            icon: 'fas fa-clock',
            value: this.formatReservationRange(
              new Date(data.reservationWatch.start),
              new Date(data.reservationWatch.end)
            ),
            label: 'Informacje na dzień',
            type: 'dashboardWatch',
          },
        ];
      });
  }

  formatReservationRange(start: Date, end: Date): string {
    const date = new Intl.DateTimeFormat('pl-PL', {
      dateStyle: 'medium',
    }).format(start);
    const startTime = new Intl.DateTimeFormat('pl-PL', {
      timeStyle: 'short',
    }).format(start);
    const endTime = new Intl.DateTimeFormat('pl-PL', {
      timeStyle: 'short',
    }).format(end);

    return `${date}\n ${startTime} - ${endTime}`;
  }

  getUpcomingUserReservation() {
    this.floorService
      .getUpcomingReservations(3)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (upcomingReservationResponse) => {
          this.notificationService.showSuccess(
            'Pobrano nadchodzące rezerwacje'
          );

          console.log(upcomingReservationResponse);
          this.floorDetails = upcomingReservationResponse;
          this.getUpcomingReservationInfo();
        },
        error: (err) => {
          this.notificationService.showError(`${err.error.message}`);
        },
      });
  }

  getUpcomingReservationInfo() {
    this.upcomingDetail = [];

    this.floorDetails.forEach((reservation) => {
      // Workstations
      reservation.workstations?.forEach((workstation) => {
        workstation.workstationReservations?.forEach((wsRes) => {
          this.upcomingDetail.push({
            floorName: reservation.name,
            objectName: `Biurko ${workstation.deskNumber}`,
            createdAt: new Date(wsRes.createdAt),
            reservationId: wsRes.id,
            reservationStart: new Date(wsRes.reservationStart),
            reservationEnd: new Date(wsRes.reservationEnd),
          });
        });
      });

      // Conference rooms
      reservation.conferenceRooms?.forEach((confRoom) => {
        confRoom.conferenceRoomReservations?.forEach((crRes) => {
          this.upcomingDetail.push({
            floorName: reservation.name,
            objectName: confRoom.name,
            createdAt: new Date(crRes.createdAt),
            reservationId: crRes.id,
            reservationStart: new Date(crRes.reservationStart),
            reservationEnd: new Date(crRes.reservationEnd),
          });
        });
      });
    });

    this.upcomingDetail.sort(
      (a, b) =>
        new Date(a.reservationStart).getTime() -
        new Date(b.reservationStart).getTime()
    );
  }

  getAvailableConfRoomCount() {
    this.confRoomResService
      .getAvailableConfRoomsCount()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: AvailableConfRoomsReservationResponse) => {
          this.availableConfRooms = res;
        },
        error: (err) => {
          this.notificationService.showError(`${err.error.message}`);
        },
      });
  }

  getAvailableWorkstationCount() {
    this.workstationResService
      .getAvailableWorkstationCount()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: AvailableWorkstationsReservationResponse) => {
          this.availableWorkstations = res;
        },
        error: (err) => {
          this.notificationService.showError(err.error.message);
        },
      });
  }

  getDashboardReservationWatch() {
    this.workstationResService
      .getDashboardReservationWatch()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: ReservationTimeRangeResponse) => {
          this.notificationService.showSuccess(`${res.start}-${res.end}`);
          console.log(res);
        },
        error: (err) => {
          this.notificationService.showError(err.error.message);
        },
      });
  }
}
