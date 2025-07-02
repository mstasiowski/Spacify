import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { Unsubscribe } from '../../../helpers/unsubscribe.class';
import { CommonModule } from '@angular/common';
import { FloorService } from '../../../services/floor.service';
import { NotificationService } from '../../../services/notification.service';
import { map, takeUntil } from 'rxjs';
import { ConferenceRoomReservationResponse } from '../../../models/response/conference-room-reservation-response';
import { WorkstationReservationResponse } from '../../../models/response/workstation-reservation-response';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user';
import { ReservationType } from '../../../enums/reservationType';
import { UserReservation } from '../../../models/user-reservation';
import { WorkstationReservationService } from '../../../services/workstation-reservation.service';
import { ConferenceRoomReservationService } from '../../../services/conference-room-reservation.service';

@Component({
  selector: 'app-my-reservations',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule,
    MatButtonToggleModule,
    MatSortModule,
  ],
  templateUrl: './my-reservations.component.html',
  styleUrl: './my-reservations.component.scss',
})
export class MyReservationsComponent
  extends Unsubscribe
  implements OnInit, AfterViewInit
{
  userReservations: UserReservation[] = [];

  displayedColumns: string[] = [
    'typeName',
    'dateTime',
    'location',
    'status',
    'actions',
  ];

  userSignal: User | null | undefined = null;
  now = new Date();

  constructor(
    private floorService: FloorService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private workstationResService: WorkstationReservationService,
    private confRoomResService: ConferenceRoomReservationService
  ) {
    super();
  }

  ngAfterViewInit(): void {
    // this.dataSource.sort = this.sort;
  }

  ngOnInit(): void {
    // Initialization logic can go here
    this.userSignal = this.authService.userSignal();
    this.setInfoBlocks();
    this.getUserReservations();
    setTimeout(() => {
      this.showReservationInfo = true;
    }, 50);

    setTimeout(() => {
      this.showReservationInfo = false;
    }, 30000);
  }

  setInfoBlocks() {
    this.infoBlocks = [
      {
        icon: 'fas fa-layer-group',
        value: this.allReservationsCount,
        label: 'Wszystkie rezerwacje',
        status: 'all',
      },
      {
        icon: 'fa-regular fa-circle-check',
        value: this.AllConfirmedReservationsCount,
        label: 'Potwierdzone rezerwacje',
        status: 'confirmed',
      },
      {
        icon: 'fa fa-circle-exclamation',
        value: this.AllpendingReservationsCount,
        label: 'Oczekujące rezerwacje',
        status: 'pending',
      },
      {
        icon: 'fa fa-flag-checkered',
        value: this.AllCompletedReservationsCount,
        label: 'Zakończone rezerwacje',
        status: 'completed',
      },
    ];
  }

  infoBlocks: {
    icon: string;
    value: string | number;
    label: string;
    status: string;
  }[] = [];

  userConferenceRoomReservations: ConferenceRoomReservationResponse[] = [];
  userWorkstationReservations: WorkstationReservationResponse[] = [];

  dataSource = new MatTableDataSource<UserReservation>([]);

  // @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatSort)
  set matSort(sort: MatSort) {
    if (sort) {
      this.dataSource.sort = sort;
    }
  }

  showReservationInfo: boolean = false;

  // getUserReservations() {
  //   this.floorService
  //     .getFloorWithUserReservations()
  //     .pipe(
  //       takeUntil(this.unsubscribe$),
  //       map((floors) => {
  //         const roomMap = new Map<number, string>();
  //         const workstationMap = new Map<number, number>();

  //         console.log('Floors with User Reservations:', floors);

  //         floors.forEach((floor) => {
  //           floor.conferenceRooms?.forEach((room) => {
  //             roomMap.set(room.id, room.name);
  //           });

  //           floor.workstations?.forEach((ws) => {
  //             workstationMap.set(ws.id, ws.deskNumber);
  //           });
  //         });

  //         const conf = floors
  //           .flatMap((floor) => floor.conferenceRooms ?? [])
  //           .flatMap((room) => room.conferenceRoomReservations ?? [])
  //           .map((res) => ({
  //             ...res,
  //             roomName: roomMap.get(res.conferenceRoomId) ?? 'Unknown Room',
  //           }));

  //         const ws = floors
  //           .flatMap((floor) => floor.workstations ?? [])
  //           .flatMap((ws) => ws.workstationReservations ?? [])
  //           .map((res) => ({
  //             ...res,
  //             deskNumber: workstationMap.get(res.workstationId) ?? -1,
  //           }));

  //         return { conf, ws };
  //       })
  //     )
  //     .subscribe({
  //       next: ({ conf, ws }) => {
  //         this.userConferenceRoomReservations = conf;
  //         this.userWorkstationReservations = ws;
  //         this.notificationService.showSuccess('Rezerwacje pobrane.');

  //         console.log(
  //           'Conference Room Reservations:',
  //           this.userConferenceRoomReservations
  //         );
  //         console.log(
  //           'Workstation Reservations:',
  //           this.userWorkstationReservations
  //         );
  //       },
  //       error: (err) => {
  //         this.notificationService.showError(
  //           'Nie udało się pobrać rezerwacji.'
  //         );
  //       },
  //     });
  // }

  getUserReservations() {
    this.floorService
      .getFloorWithUserReservations()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (floors) => {
          const reservationRows: UserReservation[] = [];

          for (const floor of floors) {
            const floorName = floor.name;

            // Konferencje
            for (const room of floor.conferenceRooms ?? []) {
              for (const res of room.conferenceRoomReservations ?? []) {
                reservationRows.push({
                  reservationId: res.id,
                  type: ReservationType.ConferenceRoom,
                  floorName,
                  locationName: room.name,
                  reservationStart: new Date(res.reservationStart),
                  reservationEnd: new Date(res.reservationEnd),
                  isConfirmed: res.isConfirmed,
                });
              }
            }

            // Stanowiska
            for (const ws of floor.workstations ?? []) {
              for (const res of ws.workstationReservations ?? []) {
                reservationRows.push({
                  reservationId: res.id,
                  type: ReservationType.Workstation,
                  floorName,
                  locationName: `Biurko #${ws.deskNumber}`,
                  reservationStart: new Date(res.reservationStart),
                  reservationEnd: new Date(res.reservationEnd),
                  isConfirmed: res.isConfirmed,
                });
              }
            }
          }

          this.userReservations = reservationRows;
          this.updateDataSource();
          this.setInfoBlocks();
        },
        error: (err) => {
          console.error('Nie udało się pobrać rezerwacji', err);
          this.notificationService.showError(
            'Nie udało się pobrać rezerwacji.',
            'Status 404'
          );
        },
      });
  }

  confirmReservation(reservation: UserReservation) {
    if (reservation.type === ReservationType.Workstation) {
      this.workstationResService
        .confirmWorkstationReservation(reservation.reservationId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (res) => {
            console.log('Reservation confirmed:', res);
            this.notificationService.showSuccess(
              `Potwierdzono rezerwację stanowiska ${reservation.locationName}`
            );
            // Aktualizacja rezerwacji w tabeli
            reservation.isConfirmed = true;
            this.updateDataSource();
          },
          error: (err) => {
            console.log('Error confirming reservation:', err);
            this.notificationService.showError(
              'Nie udało się potwierdzić rezerwacji',
              'Spróbuj ponownie później.'
            );
          },
        });
    } else if (reservation.type === ReservationType.ConferenceRoom) {
      this.confRoomResService
        .confirmConfRoomReservation(reservation.reservationId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: (res) => {
            console.log('Reservation confirmed:', res);
            this.notificationService.showSuccess(
              `Potwierdzono rezerwację sali konferencyjnej ${reservation.locationName}`
            );
            // Aktualizacja rezerwacji w tabeli
            reservation.isConfirmed = true;
            this.updateDataSource();
          },
          error: (err) => {
            console.log('Error confirming reservation:', err);
            this.notificationService.showError(
              'Nie udało się potwierdzić rezerwacji',
              'Spróbuj ponownie później.'
            );
          },
        });
    } else {
      this.notificationService.showError(
        'Nie można potwierdzić rezerwacji o nieznanym typie.',
        'Nieznany typ rezerwacji'
      );
      return;
    }
  }

  cancelReservation(reservation: UserReservation) {
    const now = new Date();

    if (
      reservation.reservationStart <= now &&
      reservation.reservationEnd >= now
    ) {
      this.notificationService.showWarning(
        'Nie można anulować rezerwacji, która jest już aktywna.',
        'Aktywna rezerwacja'
      );
      return;
    }

    if (reservation.type === ReservationType.Workstation) {
      this.workstationResService
        .deleteWorkstationReservation(reservation.reservationId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess(
              `Anulowano rezerwację stanowiska ${reservation.locationName}`
            );
            // Aktualizacja rezerwacji w tabeli
            this.userReservations = this.userReservations.filter(
              (r) => r.reservationId !== reservation.reservationId
            );
            this.updateDataSource();
          },
          error: (err) => {
            console.error('Error canceling reservation:', err);
            this.notificationService.showError(
              'Nie udało się anulować rezerwacji',
              'Spróbuj ponownie później.'
            );
          },
        });
    } else if (reservation.type === ReservationType.ConferenceRoom) {
      this.confRoomResService
        .deleteConfRoomReservation(reservation.reservationId)
        .pipe(takeUntil(this.unsubscribe$))
        .subscribe({
          next: () => {
            this.notificationService.showSuccess(
              `Anulowano rezerwację sali konferencyjnej ${reservation.locationName}`
            );
            // Aktualizacja rezerwacji w tabeli
            this.userReservations = this.userReservations.filter(
              (r) => r.reservationId !== reservation.reservationId
            );
            this.updateDataSource();
          },
          error: (err) => {
            console.error('Error canceling reservation:', err);
            this.notificationService.showError(
              'Nie udało się anulować rezerwacji',
              'Spróbuj ponownie później.'
            );
          },
        });
    } else {
      this.notificationService.showError(
        'Nieznany typ rezerwacji',
        'Nie można anulować rezerwacji o nieznanym typie.'
      );
      return;
    }
  }

  //TODO potwierdz rezerwacje godzine przed rozpoczeciem

  isConfirmBtnAvailable(reservation: UserReservation): boolean {
    const now = new Date();
    const startTime = reservation.reservationStart;
    const endTime = reservation.reservationEnd;

    return (
      !reservation.isConfirmed &&
      endTime > now &&
      startTime > now &&
      startTime.getTime() - now.getTime() <= 60 * 60 * 1000
    );
  }

  //TODO Przełączanie między typami rezerwacji

  selectedOption = 'all';

  get filteredReservations() {
    if (this.selectedOption === 'all') {
      return this.userReservations;
    } else if (this.selectedOption === 'stations') {
      return this.userReservations.filter(
        (r) => r.type === ReservationType.Workstation
      );
    } else if (this.selectedOption === 'rooms') {
      return this.userReservations.filter(
        (r) => r.type === ReservationType.ConferenceRoom
      );
    }

    return [];
  }

  selectOption(value: string): void {
    this.selectedOption = value;
    // Tu możesz emitować event lub coś zrobić z wybranym

    // ! to jest od sortowania jakiegos
    this.updateDataSource();
  }

  //TODO Liczenie rezerwacji

  get allReservationsCount() {
    return this.userReservations.length;
  }

  get allWorkstationReservationsCount() {
    return this.userReservations.filter(
      (r) => r.type === ReservationType.Workstation
    ).length;
  }

  get allConfRoomReservationsCount() {
    return this.userReservations.filter(
      (r) => r.type === ReservationType.ConferenceRoom
    ).length;
  }

  get AllConfirmedReservationsCount() {
    return this.userReservations.filter((r) => r.isConfirmed).length;
  }

  get AllpendingReservationsCount() {
    return this.userReservations.filter(
      (r) => !r.isConfirmed && r.reservationEnd > this.now
    ).length;
  }

  get AllCompletedReservationsCount() {
    return this.userReservations.filter(
      (r) => r.reservationEnd < this.now && r.isConfirmed
    ).length;
  }

  updateDataSource() {
    let data = this.userReservations;
    if (this.selectedOption === 'stations') {
      data = data.filter((r) => r.type === ReservationType.Workstation);
    } else if (this.selectedOption === 'rooms') {
      data = data.filter((r) => r.type === ReservationType.ConferenceRoom);
    }
    this.dataSource.data = data;
  }
}
