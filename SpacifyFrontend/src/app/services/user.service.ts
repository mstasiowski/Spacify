import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserResponseForAdmin } from '../models/response/user-response-for-admin';
import { UserResponse } from '../models/response/user-response';
import { ModifyUserRequest } from '../models/request/modify-user-request';
import { BlockUserRequest } from '../models/request/block-user-request';
import { ChangePasswordRequest } from '../models/request/change-password-request';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}
  getAllUsersForAdmin(): Observable<UserResponseForAdmin[]> {
    const url = `${this.apiUrl}/users/admin`;
    return this.http.get<UserResponseForAdmin[]>(url);
  }

  getAllUsers(): Observable<UserResponse[]> {
    const url = `${this.apiUrl}/users`;
    return this.http.get<UserResponse[]>(url);
  }

  getUserByIdForAdmin(userId: string): Observable<UserResponseForAdmin> {
    const url = `${this.apiUrl}/user/${userId}/admin`;
    return this.http.get<UserResponseForAdmin>(url);
  }

  getUserById(userId: string): Observable<UserResponse> {
    const url = `${this.apiUrl}/user/${userId}`;
    return this.http.get<UserResponse>(url);
  }

  getUserByEmail(email: string): Observable<UserResponseForAdmin> {
    const url = `${this.apiUrl}/user/email/${email}`;
    return this.http.get<UserResponseForAdmin>(url);
  }

  getUserByUsername(username: string): Observable<UserResponseForAdmin> {
    const url = `${this.apiUrl}/user/username/${username}`;
    return this.http.get<UserResponseForAdmin>(url);
  }

  modifyUser(
    userId: string,
    user: ModifyUserRequest
  ): Observable<UserResponseForAdmin> {
    const url = `${this.apiUrl}/user/${userId}`;
    return this.http.patch<UserResponseForAdmin>(url, user);
  }

  deleteUser(userId: string): Observable<void> {
    const url = `${this.apiUrl}/user/${userId}`;
    return this.http.delete<void>(url);
  }

  blockUserUntil(
    userId: string,
    blockUserReq: BlockUserRequest
  ): Observable<UserResponseForAdmin> {
    const url = `${this.apiUrl}/user/${userId}/block`;
    return this.http.patch<UserResponseForAdmin>(url, blockUserReq);
  }

  unblockUser(userId: string): Observable<UserResponseForAdmin> {
    const url = `${this.apiUrl}/user/${userId}/unblock`;
    return this.http.patch<UserResponseForAdmin>(url, {});
  }

  changeUserEmail(userId: string, newEmail: string): Observable<UserResponse> {
    const url = `${this.apiUrl}/user/${userId}/email`;
    return this.http.patch<UserResponse>(url, { newEmail });
  }

  changeUserPassword(
    userId: string,
    changePassReq: ChangePasswordRequest
  ): Observable<void> {
    const url = `${this.apiUrl}/user/${userId}/password`;
    return this.http.patch<void>(url, changePassReq);
  }
}
