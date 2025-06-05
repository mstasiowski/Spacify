import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FloorResponse } from '../models/response/floor-response';
import { CreateFloorRequest } from '../models/request/create-floor-request';

@Injectable({
  providedIn: 'root',
})
export class FloorService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  getFloors(): Observable<FloorResponse[]> {
    const url = `${this.apiUrl}/floors`;
    return this.http.get<FloorResponse[]>(url);
  }

  getFloorById(floorId: number): Observable<FloorResponse> {
    const url = `${this.apiUrl}/floor/${floorId}`;
    return this.http.get<FloorResponse>(url);
  }

  createFloor(newFloor: CreateFloorRequest): Observable<FloorResponse> {
    const url = `${this.apiUrl}/floor`;
    return this.http.post<FloorResponse>(url, newFloor);
  }

  updateFloor(
    floorId: number,
    updatedFloor: CreateFloorRequest
  ): Observable<FloorResponse> {
    const url = `${this.apiUrl}/floor/${floorId}`;
    return this.http.put<FloorResponse>(url, updatedFloor);
  }

  deleteFloor(floorId: number): Observable<void> {
    const url = `${this.apiUrl}/floor/${floorId}`;
    return this.http.delete<void>(url);
  }
}
