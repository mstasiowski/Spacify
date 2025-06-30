import { Component, OnInit } from '@angular/core';
import { Unsubscribe } from '../../../helpers/unsubscribe.class';
import { CommonModule } from '@angular/common';
import { FloorService } from '../../../services/floor.service';
import { NotificationService } from '../../../services/notification.service';
import { map, takeUntil } from 'rxjs';
import { ConferenceRoomReservationResponse } from '../../../models/response/conference-room-reservation-response';
import { WorkstationReservationResponse } from '../../../models/response/workstation-reservation-response';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-my-reservations',
  imports: [
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './my-reservations.component.html',
  styleUrl: './my-reservations.component.scss',
})
export class MyReservationsComponent extends Unsubscribe implements OnInit {
  userReservations: {
    type: 'Stanowisko pracy' | 'Sala konferencyjna';
    floorName: string;
    locationName: string;
    reservationStart: Date;
    reservationEnd: Date;
    isConfirmed: boolean;
  }[] = [];

  displayedColumns: string[] = [
    'typeName',
    'dateTime',
    'location',
    'status',
    'actions',
  ];

  constructor(
    private floorService: FloorService,
    private notificationService: NotificationService
  ) {
    super();
  }

  ngOnInit(): void {
    // Initialization logic can go here
    this.setInfoBlocks();
    this.getUserReservations();
  }

  setInfoBlocks() {
    this.infoBlocks = [
      {
        icon: 'fas fa-layer-group',
        value: 'test',
        label: 'Wszystkie rezerwacje',
        status: 'all',
      },
      {
        icon: 'fa-regular fa-circle-check',
        value: 'test',
        label: 'Potwierdzone rezerwacje',
        status: 'confirmed',
      },
      {
        icon: 'fa fa-circle-exclamation',
        value: 'test',
        label: 'Oczekujące rezerwacje',
        status: 'pending',
      },
      {
        icon: 'fa fa-flag-checkered',
        value: 'test',
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
          const reservationRows: {
            type: 'Stanowisko pracy' | 'Sala konferencyjna';
            floorName: string;
            locationName: string; // nazwa sali lub numer biurka
            reservationStart: Date;
            reservationEnd: Date;
            isConfirmed: boolean;
          }[] = [];

          for (const floor of floors) {
            const floorName = floor.name;

            // Konferencje
            for (const room of floor.conferenceRooms ?? []) {
              for (const res of room.conferenceRoomReservations ?? []) {
                reservationRows.push({
                  type: 'Sala konferencyjna',
                  floorName,
                  locationName: room.name,
                  reservationStart: res.reservationStart,
                  reservationEnd: res.reservationEnd,
                  isConfirmed: res.isConfirmed,
                });
              }
            }

            // Stanowiska
            for (const ws of floor.workstations ?? []) {
              for (const res of ws.workstationReservations ?? []) {
                reservationRows.push({
                  type: 'Stanowisko pracy',
                  floorName,
                  locationName: `Biurko #${ws.deskNumber}`,
                  reservationStart: res.reservationStart,
                  reservationEnd: res.reservationEnd,
                  isConfirmed: res.isConfirmed,
                });
              }
            }
          }

          this.userReservations = reservationRows;
        },
        error: (err) => {
          console.error('Nie udało się pobrać rezerwacji', err);
        },
      });
  }
}
