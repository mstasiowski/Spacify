import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ConferenceRoom } from '../models/conference-room';
import { createConferenceRoomRequest } from '../models/request/create-conference-room-request';

@Injectable({
  providedIn: 'root',
})
export class ConferenceRoomService {
  private apiUrl = `${environment.apiUrl}`;
  constructor(private http: HttpClient) {}

  getConferenceRooms(): Observable<ConferenceRoom[]> {
    const url = `${this.apiUrl}/conferenceRooms`;
    return this.http.get<ConferenceRoom[]>(url);
  }

  getConferenceRoomById(confRoomId: number): Observable<ConferenceRoom> {
    const url = `${this.apiUrl}/conferenceRoom/${confRoomId}`;
    return this.http.get<ConferenceRoom>(url);
  }

  createConferenceRoom(
    newConfRoom: createConferenceRoomRequest
  ): Observable<ConferenceRoom> {
    const url = `${this.apiUrl}/conferenceRoom`;
    return this.http.post<ConferenceRoom>(url, newConfRoom);
  }

  updateConferenceRoom(
    confRoomId: number,
    updatedConfRoom: createConferenceRoomRequest
  ): Observable<ConferenceRoom> {
    const url = `${this.apiUrl}/conferenceRoom/${confRoomId}`;
    return this.http.put<ConferenceRoom>(url, updatedConfRoom);
  }

  deleteConferenceRoom(confRoomId: number): Observable<void> {
    const url = `${this.apiUrl}/conferenceRoom/${confRoomId}`;
    return this.http.delete<void>(url);
  }
}
