import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ConferenceRoomReservationResponse } from '../models/response/conference-room-reservation-response';
import { Observable } from 'rxjs';
import { CreateConferenceRoomReservationRequest } from '../models/request/create-conf-room-reservation-request';
import { ModifyConfRoomReservationRequest } from '../models/request/modify-conf-room-reservation-request';

@Injectable({
  providedIn: 'root',
})
export class ConferenceRoomReservationService {
  private apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}

  getConfRoomReservations(): Observable<ConferenceRoomReservationResponse[]> {
    const url = `${this.apiUrl}/conferenceroom/reservations`;
    return this.http.get<ConferenceRoomReservationResponse[]>(url);
  }

  getConfRoomReservationById(
    id: number
  ): Observable<ConferenceRoomReservationResponse> {
    const url = `${this.apiUrl}/conferenceroom/reservation/${id}`;
    return this.http.get<ConferenceRoomReservationResponse>(url);
  }

  getConfRoomReservationsByUserId(
    userId: string
  ): Observable<ConferenceRoomReservationResponse[]> {
    const url = `${this.apiUrl}/conferenceroom/reservation/user/${userId}`;
    return this.http.get<ConferenceRoomReservationResponse[]>(url);
  }

  getConfRoomByDateTimeRange(
    startDate: Date,
    endDate: Date
  ): Observable<ConferenceRoomReservationResponse[]> {
    const url = `${this.apiUrl}/conferenceroom/reservation/daterange`;

    const params = new HttpParams()
      .set('startDate', startDate.toISOString())
      .set('endDate', endDate.toISOString());

    return this.http.get<ConferenceRoomReservationResponse[]>(url, { params });
  }

  createWorkstationReservation(
    newWorkstationReservation: CreateConferenceRoomReservationRequest
  ): Observable<ConferenceRoomReservationResponse> {
    const url = `${this.apiUrl}/conferenceroom/reservation`;
    return this.http.post<ConferenceRoomReservationResponse>(
      url,
      newWorkstationReservation
    );
  }

  updateConfRoomReservation(
    reservationId: number,
    request: ModifyConfRoomReservationRequest
  ): Observable<ConferenceRoomReservationResponse> {
    const url = `${this.apiUrl}/conferenceroom/reservation/${reservationId}`;
    return this.http.put<ConferenceRoomReservationResponse>(url, request);
  }

  confirmConfRoomReservation(
    reservationId: number
  ): Observable<ConferenceRoomReservationResponse> {
    const url = `${this.apiUrl}/conferenceroom/reservation/${reservationId}/confirm`;

    return this.http.patch<ConferenceRoomReservationResponse>(url, null);
  }

  deleteConfRoomReservation(reservationId: number): Observable<void> {
    const url = `${this.apiUrl}/conferenceroom/reservation/${reservationId}`;
    return this.http.delete<void>(url);
  }
}
