import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { WorkstationReservationResponse } from '../models/response/workstation-reservation-response';
import { Observable } from 'rxjs';
import { CreateWorkstationRequest } from '../models/request/create-workstation-request';
import { CreateWorkstationReservationRequest } from '../models/request/create-workstation-reservation-request';
import { ModifyWorkstationReservationRequest } from '../models/request/modify-workstation-reservation-request';

@Injectable({
  providedIn: 'root',
})
export class WorkstationReservationService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getWorkstationReservations(): Observable<WorkstationReservationResponse[]> {
    const url = `${this.apiUrl}/workstation/reservations`;
    return this.http.get<WorkstationReservationResponse[]>(url);
  }

  getWorkstationReservationById(
    id: number
  ): Observable<WorkstationReservationResponse> {
    const url = `${this.apiUrl}/workstation/reservation/${id}`;
    return this.http.get<WorkstationReservationResponse>(url);
  }

  getWorkstationReservationsByUserId(
    userId: string
  ): Observable<WorkstationReservationResponse[]> {
    const url = `${this.apiUrl}/workstation/reservation/user/${userId}`;
    return this.http.get<WorkstationReservationResponse[]>(url);
  }

  getWorkstationReservationsByDate(
    date: Date
  ): Observable<WorkstationReservationResponse[]> {
    const dateOnly = date.toISOString().split('T')[0];
    const url = `${this.apiUrl}/workstation/reservation/date/${dateOnly}`;
    return this.http.get<WorkstationReservationResponse[]>(url);
  }

  GetReservationsByDateTimeRange(
    startDate: Date,
    endDate: Date
  ): Observable<WorkstationReservationResponse[]> {
    const startDateTime = startDate.toISOString();
    const endDateTime = endDate.toISOString();
    const url = `${this.apiUrl}/workstation/reservation/daterange`;
    const params = {
      startDate: startDateTime,
      endDate: endDateTime,
    };

    return this.http.get<WorkstationReservationResponse[]>(url, { params });
  }

  getTodaysWorkstationReservations(): Observable<
    WorkstationReservationResponse[]
  > {
    const url = `${this.apiUrl}/workstation/reservation/today`;
    return this.http.get<WorkstationReservationResponse[]>(url);
  }

  GetWorkstationReservationsByFloorAndDate(
    floorId: number,
    date: Date
  ): Observable<WorkstationReservationResponse[]> {
    const url = `${this.apiUrl}/workstation/reservations/floor/${floorId}`;
    const params = new HttpParams().set('date', date.toISOString());
    return this.http.get<WorkstationReservationResponse[]>(url, { params });
  }

  createWorkstationReservation(
    newWorkstationReservation: CreateWorkstationReservationRequest
  ): Observable<WorkstationReservationResponse> {
    const url = `${this.apiUrl}/workstation/reservation`;
    return this.http.post<WorkstationReservationResponse>(
      url,
      newWorkstationReservation
    );
  }

  modifyWorkstationReservation(
    reservationId: number,
    workstationReservation: ModifyWorkstationReservationRequest
  ): Observable<WorkstationReservationResponse> {
    const url = `${this.apiUrl}/workstation/reservation/${reservationId}`;
    return this.http.patch<WorkstationReservationResponse>(
      url,
      workstationReservation
    );
  }

  confirmWorkstationReservation(
    reservationId: number
  ): Observable<WorkstationReservationResponse> {
    const url = `${this.apiUrl}/workstation/reservation/${reservationId}/confirm`;

    return this.http.patch<WorkstationReservationResponse>(url, null);
  }

  deleteWorkstationReservation(reservationId: number): Observable<void> {
    const url = `${this.apiUrl}/workstation/reservation/${reservationId}`;
    return this.http.delete<void>(url);
  }
}
