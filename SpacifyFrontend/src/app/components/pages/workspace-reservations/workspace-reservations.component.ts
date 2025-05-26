import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { WorkstationReservationService } from '../../../services/workstation-reservation.service';
import { WorkstationReservationResponse } from '../../../models/response/workstation-reservation-response';
import { CreateWorkstationReservationRequest } from '../../../models/request/create-workstation-reservation-request';
import { ModifyWorkstationReservationRequest } from '../../../models/request/modify-workstation-reservation-request';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { User } from '../../../models/user';

@Component({
  selector: 'app-workspace-reservations',
  imports: [CommonModule, FormsModule],
  templateUrl: './workspace-reservations.component.html',
  styleUrl: './workspace-reservations.component.scss',
})
export class WorkspaceReservationsComponent implements OnInit {
  /**
   *
   */
  constructor(
    private authService: AuthService,
    private workstationResService: WorkstationReservationService
  ) {}
  ngOnInit(): void {
    const user = this.authService.userSignal();
    if (user != undefined) {
      this.currentUser = user ?? null;
    }
  }

  currentUser: User | null = null;
  reservations: WorkstationReservationResponse[] = [];
  reservation: WorkstationReservationResponse | null = null;

  reservationId!: number;
  userId: string = '';
  startDateLocal: string = '';
  endDateLocal: string = '';
  date!: string;

  createRequest: CreateWorkstationReservationRequest = {
    userId: '',
    workstationId: 0,
    reservationStart: new Date(),
    reservationEnd: new Date(),
  };

  modifyRequest: ModifyWorkstationReservationRequest = {
    userId: '',
    workstationId: 0,
    reservationStart: new Date(),
    reservationEnd: new Date(),
  };

  // Konwersja daty lokalnej do UTC ISO stringa
  convertLocalToUtc(localString: string): string {
    const localDate = new Date(localString);
    return localDate.toISOString(); // ISO 8601 UTC format
  }

  getAllReservations() {
    this.workstationResService
      .getWorkstationReservations()
      .subscribe((res) => (this.reservations = res));
  }

  getReservationById() {
    this.workstationResService
      .getWorkstationReservationById(this.reservationId)
      .subscribe((res) => (this.reservation = res));
  }

  getReservationsByUserId() {
    this.workstationResService
      .getWorkstationReservationsByUserId(this.userId)
      .subscribe((res) => (this.reservations = res));
  }

  getReservationsByDate() {
    const dateObj = new Date(this.date);
    this.workstationResService
      .getWorkstationReservationsByDate(dateObj)
      .subscribe((res) => (this.reservations = res));
  }

  getReservationsByDateRange() {
    const start = new Date(this.startDateLocal);
    const end = new Date(this.endDateLocal);
    this.workstationResService
      .getWorkstationReservationsByDateRange(start, end)
      .subscribe((res) => (this.reservations = res));
  }

  getTodaysReservations() {
    this.workstationResService
      .getTodaysWorkstationReservations()
      .subscribe((res) => (this.reservations = res));
  }

  createReservation() {
    this.createRequest.reservationStart = new Date(
      this.convertLocalToUtc(this.startDateLocal)
    );
    this.createRequest.reservationEnd = new Date(
      this.convertLocalToUtc(this.endDateLocal)
    );

    this.workstationResService
      .createWorkstationReservation(this.createRequest)
      .subscribe((res) => {
        this.reservation = res;
        this.getAllReservations();
      });
  }

  modifyReservation() {
    this.modifyRequest.reservationStart = new Date(
      this.convertLocalToUtc(this.startDateLocal)
    );
    this.modifyRequest.reservationEnd = new Date(
      this.convertLocalToUtc(this.endDateLocal)
    );

    this.workstationResService
      .modifyWorkstationReservation(this.reservationId, this.modifyRequest)
      .subscribe((res) => {
        this.reservation = res;
        this.getAllReservations();
      });
  }

  confirmReservation() {
    this.workstationResService
      .confirmWorkstationReservation(this.reservationId)
      .subscribe((res) => {
        this.reservation = res;
        this.getAllReservations();
      });
  }

  deleteReservation() {
    this.workstationResService
      .deleteWorkstationReservation(this.reservationId)
      .subscribe(() => {
        this.reservation = null;
        this.getAllReservations();
      });
  }

  // 🛠️ (opcjonalnie) Do formularzy, jeśli chcesz wyświetlać datę UTC jako lokalną:
  formatUtcForInput(datetime: string | Date): string {
    const date = new Date(datetime);
    return date.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm
  }

  //Todo

  sidebarItems = [
    { title: 'Dashboard', icon: '📊', href: '/dashboard' },
    { title: 'Rezerwacje', icon: '🗓️', href: '/reservations' },
    { title: 'Ustawienia', icon: '⚙️', href: '/settings' },
  ];

  logout() {
    console.log('wylogowanie');
  }
}
