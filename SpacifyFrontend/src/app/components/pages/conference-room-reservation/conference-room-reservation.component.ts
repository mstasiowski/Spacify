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
import {
  dateMaxValidator,
  dateMinValidator,
  endAfterStartTimeValidator,
  fullDateTimeMinValidator,
  fullOrHalfHourValidator,
  startNotEqualEndTimeValidator,
} from '../../../helpers/validators';
import { ConferenceRoomCardComponent } from './conference-room-card/conference-room-card.component';
import { excludeWeekendsFilter } from '../../../helpers/date-filters';
import { NotificationService } from '../../../services/notification.service';

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
    private floorService: FloorService,
    private notificationService: NotificationService
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

  availableRooms!: number;
  availableCapacity!: number;
  reservationDay: string = '';
  reservationTime: string = '';
  infoBlocks: { icon: string; value: string | number; label: string }[] = [];
  confRoomReservationForm!: FormGroup;
  floors: FloorResponse[] = [];
  filteredRooms: ConferenceRoomResponse[] = [];
  reservations: ConferenceRoomReservationResponse[] = [];
  minDateForDatePicker: Date = new Date();
  maxDateForDatePicker: Date = new Date(
    new Date().getTime() + 7 * 24 * 60 * 60 * 1000
  ); // 7 dni od dzisiaj
  excludeWeekendsFilter = excludeWeekendsFilter;
  isResFormValid: boolean = false;

  setInfoBlocks() {
    this.infoBlocks = [
      {
        icon: 'fas fa-door-open',
        value: this.availableRooms,
        label: 'Dostępne sale',
      },
      {
        icon: 'fas fa-users',
        value: this.availableCapacity,
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
    // const now = new Date();
    // const currentHour = now.getHours();
    // const startHour = Math.min(Math.max(currentHour + 1, 8), 17);
    // const endHour = Math.min(startHour + 1, 18);

    // const today = new Date();
    // const defaultResStart = new Date(
    //   today.getFullYear(),
    //   today.getMonth(),
    //   today.getDate(),
    //   startHour,
    //   0,
    //   0,
    //   0
    // );
    // const defaultResEnd = new Date(
    //   today.getFullYear(),
    //   today.getMonth(),
    //   today.getDate(),
    //   endHour,
    //   0,
    //   0,
    //   0
    // );

    const {
      date: defaultDate,
      start: defaultResStart,
      end: defaultResEnd,
    } = this.getDefaultReservationTimes();

    this.confRoomReservationForm = this.fb.group(
      {
        date: [
          // new Date().toISOString().split('T')[0],
          defaultDate,
          [
            Validators.required,
            // dateMinValidator(this.minDateForDatePicker),
            // dateMaxValidator(this.maxDateForDatePicker),
          ],
        ],
        startTime: [
          defaultResStart,
          [Validators.required, fullOrHalfHourValidator()],
        ],
        endTime: [
          defaultResEnd,
          [Validators.required, fullOrHalfHourValidator()],
        ],
        floor: [''],
      },
      {
        validators: [
          startNotEqualEndTimeValidator(),
          endAfterStartTimeValidator(),
          fullDateTimeMinValidator(new Date()),
        ],
      }
    );
  }

  getDefaultReservationTimes(): {
    date: Date;
    start: Date;
    end: Date;
  } {
    const now = new Date();
    let date = new Date(now);
    let startHour = now.getHours() + 1;

    // Jeśli już po 17:00, ustaw na jutro 8:00-9:00
    if (now.getHours() >= 17) {
      date.setDate(date.getDate() + 1);
      startHour = 8;
    }
    // Jeśli przed 8:00, ustaw na dziś 8:00-9:00
    if (now.getHours() < 8) {
      startHour = 8;
    }
    // Jeśli startHour > 17, ustaw na jutro 8:00-9:00
    if (startHour > 17) {
      date.setDate(date.getDate() + 1);
      startHour = 8;
    }

    const start = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      startHour,
      0,
      0,
      0
    );
    const end = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      startHour + 1,
      0,
      0,
      0
    );

    // Format daty do yyyy-MM-dd jeśli używasz input type="date"
    // const dateString = date.toISOString().split('T')[0];

    return { date, start, end };
  }

  handleFormChanges() {
    this.confRoomReservationForm.valueChanges
      .pipe(
        distinctUntilChanged(),
        // (prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)
        takeUntil(this.unsubscribe$)
      )
      .subscribe((formValue) => {
        this.getReservationFromFormValue(formValue);

        // Aktualizuj datę
        const date = formValue.date;
        if (date instanceof Date) {
          this.reservationDay = date.toLocaleDateString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
          });

          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          this.reservationDay = `${day}/${month}`;
        }

        // Aktualizuj godziny
        const start = formValue.startTime;
        const end = formValue.endTime;
        if (start instanceof Date && end instanceof Date) {
          const startStr = start.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
          });
          const endStr = end.toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit',
          });
          this.reservationTime = `${startStr}-${endStr}`;
        }

        if (!this.confRoomReservationForm.valid) {
          this.availableRooms = 0;
          this.availableCapacity = 0;
          this.reservationTime = '8:00 - 18:00';
          //! brak sal
          this.filteredRooms = [];

          this.setInfoBlocks();
          this.isResFormValid = false;
        } else this.isResFormValid = true;

        // this.setInfoBlocks(); // odśwież kafelki
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
          this.calculateAvailableCapacity(); // DODAJ TO!
          this.setInfoBlocks();
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

          this.calculateAvailableCapacity();
          this.setInfoBlocks();
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
        },
        error: (error) => {
          console.error('Błąd podczas ładowania pięter:', error);
          this.notificationService.showError(
            'Nie udało się pobrać pięter. Spróbuj ponownie później.',
            `Status: ${error.status}`
          );
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
          this.calculateAvailableCapacity();
          this.setInfoBlocks();
          console.log('CAPACITY', this.availableCapacity);
        },
        error: (error) => {
          this.notificationService.showError(
            'Nie udało się pobrać rezerwacji sal konferencyjnych.',
            `Status: ${error.status}`
          );
        },
      });
  }

  calculateAvailableCapacity(): void {
    if (!this.filteredRooms.length) return;

    // Pobierz aktualny zakres z formularza
    const formValue = this.confRoomReservationForm.value;
    if (!formValue.date || !formValue.startTime || !formValue.endTime) return;

    const startDateTime = this.combinaDateAndTime(
      formValue.date,
      formValue.startTime
    );
    const endDateTime = this.combinaDateAndTime(
      formValue.date,
      formValue.endTime
    );

    // Sprawdź, które sale są zajęte w wybranym przedziale czasowym
    const freeRooms = this.filteredRooms.filter(
      (room) =>
        !this.isRoomReservedInTimeRange(room.id, startDateTime, endDateTime)
    );

    // Aktualizuj oba pola
    this.availableRooms = freeRooms.length;
    this.availableCapacity = freeRooms.reduce(
      (sum, room) => sum + room.capacity,
      0
    );
  }

  // Pomocnicza funkcja do sprawdzania czy sala jest zarezerwowana w określonym czasie
  private isRoomReservedInTimeRange(
    roomId: number,
    start: Date,
    end: Date
  ): boolean {
    return this.reservations.some(
      (res) =>
        res.conferenceRoomId === roomId &&
        new Date(res.reservationStart) < end &&
        new Date(res.reservationEnd) > start
    );
  }

  getReservationFromFormValue(formValue: any) {
    if (!formValue.date || !formValue.startTime || !formValue.endTime) return;

    if (this.confRoomReservationForm.valid) {
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
    } else {
      this.notificationService.showError(
        'Formularz jest nieprawidłowy, sprawdź błędy.'
      );
    }
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
