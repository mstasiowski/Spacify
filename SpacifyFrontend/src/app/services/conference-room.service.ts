import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { createConferenceRoomRequest } from '../models/request/create-conference-room-request';
import { ConferenceRoomResponse } from '../models/response/conference-room-response';

@Injectable({
  providedIn: 'root',
})
export class ConferenceRoomService {
  private apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}

  getConferenceRooms(): Observable<ConferenceRoomResponse[]> {
    const url = `${this.apiUrl}/conferenceRooms`;
    return this.http.get<ConferenceRoomResponse[]>(url);
  }

  getConfRoomsByFloor(floorId: number): Observable<ConferenceRoomResponse[]> {
    const url = `${this.apiUrl}/conferenceRooms/floor/${floorId}`;
    return this.http.get<ConferenceRoomResponse[]>(url);
  }

  getConferenceRoomById(
    confRoomId: number
  ): Observable<ConferenceRoomResponse> {
    const url = `${this.apiUrl}/conferenceRoom/${confRoomId}`;
    return this.http.get<ConferenceRoomResponse>(url);
  }

  createConferenceRoom(
    newConfRoom: createConferenceRoomRequest
  ): Observable<ConferenceRoomResponse> {
    const url = `${this.apiUrl}/conferenceRoom`;
    return this.http.post<ConferenceRoomResponse>(url, newConfRoom);
  }

  updateConferenceRoom(
    confRoomId: number,
    updatedConfRoom: createConferenceRoomRequest
  ): Observable<ConferenceRoomResponse> {
    const url = `${this.apiUrl}/conferenceRoom/${confRoomId}`;
    return this.http.put<ConferenceRoomResponse>(url, updatedConfRoom);
  }

  deleteConferenceRoom(confRoomId: number): Observable<void> {
    const url = `${this.apiUrl}/conferenceRoom/${confRoomId}`;
    return this.http.delete<void>(url);
  }
}
