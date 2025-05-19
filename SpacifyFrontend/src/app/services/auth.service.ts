import { Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  filter,
  finalize,
  Observable,
  of,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { RegisterUserRequest } from '../models/request/register-user-request';
import { RegisterUserResponse } from '../models/response/register-user-response';
import { TokenResponse } from '../models/response/token-response';
import { LoginUserRequest } from '../models/request/login-user-request';
import { User } from '../models/user';
import { Router } from '@angular/router';
import { UserRole } from '../enums/user-role.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/Auth`;

  constructor(private http: HttpClient, private router: Router) {}

  userSignal = signal<User | undefined | null>(undefined);

  register(
    registerUser: RegisterUserRequest
  ): Observable<RegisterUserResponse> {
    const url = `${this.apiUrl}/register`;
    return this.http.post<RegisterUserResponse>(url, registerUser);
  }

  loginUser(loginRequest: LoginUserRequest): Observable<TokenResponse> {
    const url = `${this.apiUrl}/login`;
    return this.http.post<TokenResponse>(url, loginRequest, {
      withCredentials: true,
    });
  }

  refreshToken(): Observable<TokenResponse> {
    const url = `${this.apiUrl}/refresh-token`;
    return this.http
      .post<TokenResponse>(url, {}, { withCredentials: true })
      .pipe(
        tap((response) => {
          this.saveAccessToken(response.accessToken);
        })
      );
  }

  logoutUser(): Observable<void> {
    const url = `${this.apiUrl}/logout`;
    return this.http.post<void>(url, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.clearAccessToken();
        this.userSignal.set(null);
        this.router.navigateByUrl('/login');
      })
    );
  }

  saveAccessToken(token: string): void {
    localStorage.setItem('accessToken', token.toString());
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  clearAccessToken(): void {
    localStorage.removeItem('accessToken');
  }

  decodeUserFromToken(token: string): User | null {
    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const payloadJson = atob(base64);
      const payload = JSON.parse(payloadJson);

      const user: User = {
        id: payload[
          'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'
        ],
        username:
          payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name'],
        role: payload[
          'http://schemas.microsoft.com/ws/2008/06/identity/claims/role'
        ] as UserRole,
        exp: new Date(payload.exp * 1000),
      };

      return user;
    } catch (error) {
      console.error('Błąd dekodowania tokena:', error);
      return null;
    }
  }

  getUserInfo(): User | null {
    let accessToken = this.getAccessToken();

    if (accessToken === null) return null;

    return this.decodeUserFromToken(accessToken);
  }

  //Info <Do usunięcia>

  getConferenceRoom(): Observable<any> {
    const url = `https://localhost:7105/conferenceRooms`;
    return this.http.get<any>(url);
  }

  getWorkstations(): Observable<any> {
    const url = `https://localhost:7105/workstations`;
    return this.http.get<any>(url);
  }

  //Info </Do usunięcia>
}
