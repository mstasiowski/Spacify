import { Component, OnInit } from '@angular/core';
import { Unsubscribe } from '../../../helpers/unsubscribe.class';
import { ConferenceRoomReservationResponse } from '../../../models/response/conference-room-reservation-response';
import { ConferenceRoomReservationService } from '../../../services/conference-room-reservation.service';
import { CommonModule } from '@angular/common';
import { CreateConferenceRoomReservationRequest } from '../../../models/request/create-conf-room-reservation-request';
import { ConferenceRoomResponse } from '../../../models/response/conference-room-response';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ConferenceRoomService } from '../../../services/conference-room.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { FloorService } from '../../../services/floor.service';
import { distinctUntilChanged, takeUntil } from 'rxjs';
import { FloorResponse } from '../../../models/response/floor-response';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { fullOrHalfHourValidator } from '../../../helpers/validators';
import { ConferenceRoomCardComponent } from './conference-room-card/conference-room-card.component';

@Component({
  selector: 'app-conference-room-reservation',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule, // dodaj to
    MatOptionModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTimepickerModule,
    ConferenceRoomCardComponent,
  ],
  templateUrl: './conference-room-reservation.component.html',
  styleUrl: './conference-room-reservation.component.scss',
})
export class ConferenceRoomReservationComponent
  extends Unsubscribe
  implements OnInit
{
  constructor(
    private fb: FormBuilder,
    private conferenceRoomService: ConferenceRoomService,
    private reservationService: ConferenceRoomReservationService,
    private floorService: FloorService
  ) {
    super();
  }

  ngOnInit(): void {
    this.setInfoBlocks();
    this.getFloors();
    this.getAllConferenceRooms();
    this.formInit();
    this.handleFormChanges();

    // this.getReservations(new Date(defaultResStart), new Date(defaultResEnd));
  }

  availableRooms: number = 7;
  totalCapacity: number = 10;
  reservationDay: string = '10/06';
  reservationTime: string = '8:00 - 18:00';
  infoBlocks: { icon: string; value: string | number; label: string }[] = [];
  confRoomReservationForm!: FormGroup;
  floors: FloorResponse[] = [];
  filteredRooms: ConferenceRoomResponse[] = [];
  reservations: ConferenceRoomReservationResponse[] = [];

  setInfoBlocks() {
    this.infoBlocks = [
      {
        icon: 'fas fa-door-open',
        value: this.availableRooms,
        label: 'Dostępne sale',
      },
      {
        icon: 'fas fa-users',
        value: this.totalCapacity,
        label: 'Maksymalna pojemność',
      },
      {
        icon: 'fas fa-calendar-day',
        value: this.reservationDay,
        label: 'Wybrana data',
      },
      {
        icon: 'fas fa-clock',
        value: this.reservationTime,
        label: 'Godziny rezerwacji',
      },
    ];
  }

  formInit() {
    const now = new Date();
    const currentHour = now.getHours();
    const startHour = Math.min(Math.max(currentHour + 1, 8), 17);
    const endHour = Math.min(startHour + 1, 18);

    const today = new Date();
    const defaultResStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      startHour,
      0,
      0,
      0
    );
    const defaultResEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      endHour,
      0,
      0,
      0
    );

    this.confRoomReservationForm = this.fb.group({
      date: new Date().toISOString().split('T')[0],
      startTime: [
        defaultResStart,
        [Validators.required, fullOrHalfHourValidator()],
      ],
      endTime: [
        defaultResEnd,
        [Validators.required, fullOrHalfHourValidator()],
      ],
      floor: ['', Validators.required],
    });
  }

  handleFormChanges() {
    this.confRoomReservationForm.valueChanges
      .pipe(
        distinctUntilChanged(
          (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        ),
        takeUntil(this.unsubscribe$)
      )
      .subscribe((formValue) => {
        this.getReservationFromFormValue(formValue);
      });

    this.confRoomReservationForm
      .get('floor')
      ?.valueChanges.pipe(takeUntil(this.unsubscribe$))
      .subscribe((floorId) => {
        if (floorId) {
          this.getConferenceRoomsByFloor(Number(floorId));
        } else {
          this.getAllConferenceRooms();
        }
      });
  }

  getAllConferenceRooms() {
    this.conferenceRoomService
      .getConferenceRooms()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (rooms: ConferenceRoomResponse[]) => {
          this.filteredRooms = rooms;
          console.log('Załadowane sale konferencyjne:', this.filteredRooms);
        },
        error: (error) => {
          this.filteredRooms = [];
          if (error.status === 404) {
            console.warn('Brak sal konferencyjnych na tym piętrze.');
            return;
          } else {
            console.error('Błąd podczas ładowania sal konferencyjnych:', error);
          }
        },
      });
  }

  getConferenceRoomsByFloor(floorId: number) {
    this.conferenceRoomService
      .getConfRoomsByFloor(floorId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (rooms: ConferenceRoomResponse[]) => {
          this.filteredRooms = rooms;
          console.log(
            `Załadowane sale konferencyjne z piętra o id:${floorId}:`,
            this.filteredRooms
          );
        },
        error: (error) => {
          this.filteredRooms = [];
          if (error.status === 404) {
            console.warn('Brak sal konferencyjnych na tym piętrze.');
            return;
          } else {
            console.error('Błąd podczas ładowania sal konferencyjnych:', error);
          }
        },
      });
  }

  getFloors() {
    this.floorService
      .getFloors()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (floors: FloorResponse[]) => {
          this.floors = floors;
          console.log('Załadowane piętra:', this.floors);
        },
        error: (error) => {
          console.error('Błąd podczas ładowania pięter:', error);
        },
      });
  }

  getReservations(startDate: Date, endDate: Date) {
    this.reservationService
      .getConfRoomByDateTimeRange(startDate, endDate)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (reservations: ConferenceRoomReservationResponse[]) => {
          // this.reservations = reservations.map((res) => ({
          //   ...res,
          //   reservationStart: new Date(res.reservationStart + 'Z'),
          //   reservationEnd: new Date(res.reservationEnd + 'Z'),
          // }));
          this.reservations = reservations;
          console.log('Załadowane rezerwacje:', this.reservations);
        },
        error: (error) => {
          console.error('Błąd podczas ładowania rezerwacji:', error);
        },
      });
  }

  getReservationFromFormValue(formValue: any) {
    if (!formValue.date || !formValue.startTime || !formValue.endTime) return;

    console.log('Form Value:', formValue);

    const startDateTime = this.combinaDateAndTime(
      formValue.date,
      formValue.startTime
    );
    const endDateTime = this.combinaDateAndTime(
      formValue.date,
      formValue.endTime
    );
    console.log(`Pobrano rezerwacje od ${startDateTime} do ${endDateTime}`);
    this.getReservations(startDateTime, endDateTime);
  }

  combinaDateAndTime(date: string | Date, time: string | Date): Date {
    const parsedDate = typeof date === 'string' ? new Date(date) : date;
    const parsedTime = new Date(time);

    const year = parsedDate.getFullYear();
    const month = parsedDate.getMonth();
    const day = parsedDate.getDate();

    const hours = parsedTime.getHours();
    const minutes = parsedTime.getMinutes();

    return new Date(year, month, day, hours, minutes, 0, 0);
  }

  getCurrentReservationForConfRoom(
    confRoomId: number
  ): ConferenceRoomReservationResponse | undefined {
    return this.reservations.find((res) => res.conferenceRoomId === confRoomId);
  }

  //? Generowane
  // reservationForm: FormGroup;
  // conferenceRooms: ConferenceRoomResponse[] = [];
  // filteredRooms: ConferenceRoomResponse[] = [];
  // reservations: ConferenceRoomReservationResponse[] = [];
  // selectedDate: Date = new Date();
  // selectedReservation: any = null;
  // Info tiles data
  // currentHour = new Date().getHours();
  // availableRooms = 0;
  // totalCapacity = 0;
  // nextAvailableDate = new Date();
  // reservationTime = '8:00 - 18:00';
  // floors!: FloorResponse[]; // Przykładowe piętra
  // timeSlots = this.generateTimeSlots();
  // infoTiles: { icon: string; value: string | number; label: string }[] = [];
  // constructor(
  //   private fb: FormBuilder,
  //   private conferenceRoomService: ConferenceRoomService,
  //   private reservationService: ConferenceRoomReservationService,
  //   private floorService: FloorService
  // ) {
  //   super();
  //   this.reservationForm = this.fb.group({
  //     date: [new Date().toISOString().split('T')[0], Validators.required],
  //     startTime: ['', Validators.required],
  //     endTime: ['', Validators.required],
  //     floor: ['', Validators.required],
  //   });
  // }
  // ngOnInit() {
  //   this.loadFloors();
  //   this.loadReservations();
  //   this.setNextAvailableDate();
  //   this.setInfoTiles();
  // }
  // setInfoTiles() {
  //   this.infoTiles = [
  //     {
  //       icon: 'fas fa-door-open',
  //       value: this.availableRooms,
  //       label: 'Dostępne sale',
  //     },
  //     {
  //       icon: 'fas fa-users',
  //       value: this.totalCapacity,
  //       label: 'Maksymalna pojemność',
  //     },
  //     {
  //       icon: 'fas fa-calendar-day',
  //       value: this.formatDate(this.nextAvailableDate),
  //       label: 'Następny wolny dzień',
  //     },
  //     {
  //       icon: 'fas fa-clock',
  //       value: this.reservationTime,
  //       label: 'Godziny rezerwacji',
  //     },
  //   ];
  // }
  // loadConferenceRooms() {
  //   this.conferenceRoomService.getConferenceRooms().subscribe((rooms: any) => {
  //     this.conferenceRooms = rooms;
  //     this.filteredRooms = rooms;
  //     this.calculateInfoTiles();
  //   });
  // }
  // loadFloors() {
  //   this.floorService
  //     .getFloors()
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe({
  //       next: (floors) => {
  //         this.floors = floors;
  //         this.reservationForm.patchValue({ floor: this.floors[0]?.id });
  //         console.log('Załadowane piętra:', this.floors);
  //         this.onFormChange(); // Load rooms for the first floor
  //       },
  //       error: (error) => {
  //         console.error('Błąd podczas ładowania pięter:', error);
  //       },
  //     });
  // }
  // loadReservations() {
  //   const startDate = new Date(this.selectedDate);
  //   startDate.setHours(0, 0, 0, 0);
  //   const endDate = new Date(this.selectedDate);
  //   endDate.setHours(23, 59, 59, 999);
  //   this.reservationService
  //     .getConfRoomByDateTimeRange(startDate, endDate)
  //     .subscribe((reservations) => {
  //       this.reservations = reservations;
  //     });
  // }
  // onFormChange() {
  //   const formValue = this.reservationForm.value;
  //   if (formValue.floor) {
  //     this.conferenceRoomService
  //       .getConfRoomsByFloor(formValue.floor)
  //       .subscribe((rooms: any) => {
  //         this.filteredRooms = rooms;
  //       });
  //   } else {
  //     this.filteredRooms = this.conferenceRooms;
  //   }
  //   if (formValue.date) {
  //     this.selectedDate = new Date(formValue.date);
  //     this.loadReservations();
  //   }
  // }
  // isRoomAvailable(roomId: number, startTime: string, endTime: string): boolean {
  //   const requestStart = new Date(
  //     `${this.reservationForm.value.date}T${startTime}`
  //   );
  //   const requestEnd = new Date(
  //     `${this.reservationForm.value.date}T${endTime}`
  //   );
  //   return !this.reservations.some((reservation) => {
  //     if (reservation.conferenceRoomId !== roomId) return false;
  //     const resStart = new Date(reservation.reservationStart);
  //     const resEnd = new Date(reservation.reservationEnd);
  //     return requestStart < resEnd && requestEnd > resStart;
  //   });
  // }
  // getReservationForRoom(
  //   roomId: number
  // ): ConferenceRoomReservationResponse | null {
  //   return this.reservations.find((r) => r.conferenceRoomId === roomId) || null;
  // }
  // selectRoom(room: ConferenceRoomResponse) {
  //   const formValue = this.reservationForm.value;
  //   if (formValue.date && formValue.startTime && formValue.endTime) {
  //     if (
  //       this.isRoomAvailable(room.id, formValue.startTime, formValue.endTime)
  //     ) {
  //       this.selectedReservation = {
  //         room: room,
  //         date: formValue.date,
  //         startTime: formValue.startTime,
  //         endTime: formValue.endTime,
  //       };
  //     }
  //   }
  // }
  // confirmReservation() {
  //   if (this.selectedReservation) {
  //     const request: CreateConferenceRoomReservationRequest = {
  //       userId: 'current-user-id', // Pobierz z aktualnego użytkownika
  //       conferenceRoomId: this.selectedReservation.room.id,
  //       reservationStart: new Date(
  //         `${this.selectedReservation.date}T${this.selectedReservation.startTime}`
  //       ).toISOString(),
  //       reservationEnd: new Date(
  //         `${this.selectedReservation.date}T${this.selectedReservation.endTime}`
  //       ).toISOString(),
  //     };
  //     this.reservationService.createWorkstationReservation(request).subscribe(
  //       (response) => {
  //         console.log('Rezerwacja utworzona:', response);
  //         this.selectedReservation = null;
  //         this.loadReservations();
  //         this.reservationForm.reset();
  //       },
  //       (error) => {
  //         console.error('Błąd podczas tworzenia rezerwacji:', error);
  //       }
  //     );
  //   }
  // }
  // cancelReservation() {
  //   this.selectedReservation = null;
  // }
  // private generateTimeSlots(): string[] {
  //   const slots = [];
  //   for (let hour = 8; hour < 18; hour++) {
  //     slots.push(`${hour.toString().padStart(2, '0')}:00`);
  //     slots.push(`${hour.toString().padStart(2, '0')}:30`);
  //   }
  //   slots.push('18:00');
  //   return slots;
  // }
  // private calculateInfoTiles() {
  //   this.availableRooms = this.conferenceRooms.length;
  //   this.totalCapacity = this.conferenceRooms.reduce(
  //     (sum, room) => sum + room.capacity,
  //     0
  //   );
  // }
  // private setNextAvailableDate() {
  //   this.nextAvailableDate = new Date();
  //   this.nextAvailableDate.setDate(this.nextAvailableDate.getDate() + 1);
  // }
  // formatDate(date: Date): string {
  //   return date.toLocaleDateString('pl-PL', {
  //     day: 'numeric',
  //     month: 'long',
  //   });
  // }
  // getFloorName(floorId: number): string {
  //   return `Piętro ${floorId}`;
  // }
  //? /generowane
}
