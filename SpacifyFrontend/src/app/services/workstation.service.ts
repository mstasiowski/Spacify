import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkstationResponse } from '../models/response/workstation-response';
import { CreateWorkstationRequest } from '../models/request/create-workstation-request';

@Injectable({
  providedIn: 'root',
})
export class WorkstationService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getWorkstations(): Observable<WorkstationResponse[]> {
    const url = `${this.apiUrl}/workstations`;
    return this.http.get<WorkstationResponse[]>(url);
  }

  getWorkstationById(workstationId: number): Observable<WorkstationResponse> {
    const url = `${this.apiUrl}/workstation/${workstationId}`;
    return this.http.get<WorkstationResponse>(url);
  }

  createWorkstation(
    newWorkstation: CreateWorkstationRequest
  ): Observable<WorkstationResponse> {
    const url = `${this.apiUrl}/workstation`;
    return this.http.post<WorkstationResponse>(url, newWorkstation);
  }

  updateWorkstation(
    workstationId: number,
    workstation: CreateWorkstationRequest
  ): Observable<WorkstationResponse> {
    const url = `${this.apiUrl}/workstation/${workstationId}`;
    return this.http.put<WorkstationResponse>(url, workstation);
  }

  deleteWorkstation(workstationId: number): Observable<void> {
    const url = `${this.apiUrl}/workstation/${workstationId}`;
    return this.http.delete<void>(url);
  }
}
