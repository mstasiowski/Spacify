import { Component, OnInit } from '@angular/core';
import { Unsubscribe } from '../../../../helpers/unsubscribe.class';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { UserService } from '../../../../services/user.service';
import { NotificationService } from '../../../../services/notification.service';
import { takeUntil } from 'rxjs';
import { UserResponse } from '../../../../models/response/user-response';
import { UserResponseForAdmin } from '../../../../models/response/user-response-for-admin';

@Component({
  selector: 'app-manage-user',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-user.component.html',
  styleUrl: './manage-user.component.scss',
})
export class ManageUserComponent extends Unsubscribe implements OnInit {
  getUserInformationForm: FormGroup;

  users: UserResponseForAdmin[] = [];
  user: UserResponseForAdmin | null = null;

  selectedForm:
    | 'getUserInformation'
    | 'blockUser'
    | 'deleteUser'
    | 'changePassword'
    | 'changeInformation' = 'getUserInformation';

  ngOnInit(): void {
    this.getAllUsersForAdmin();
  }

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private notificationService: NotificationService
  ) {
    super();

    this.getUserInformationForm = this.fb.group({
      userId: ['', Validators.required],
    });
  }

  getAllUsersForAdmin() {
    this.userService
      .getAllUsersForAdmin()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: UserResponseForAdmin[]) => {
          this.users = res;
          this.notificationService.showSuccess(
            'Pobrano wszystkich użytkowników'
          );
          console.log('Users:', this.users);
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się pobrać użytkowników'
          );
          console.error('Error fetching users:', err);
        },
      });
  }

  getUserInformationForAdmin(userId: string) {
    this.userService
      .getUserByIdForAdmin(userId)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res: UserResponseForAdmin) => {
          this.notificationService.showSuccess(
            'Pobrano informacje o użytkowniku'
          );
          this.user = res;
        },
        error: (err) => {
          this.notificationService.showError(
            'Nie udało się pobrać informacji o użytkowniku'
          );
          console.error('Error fetching user information:', err);
        },
      });
  }

  onGetUserInformationSubmit() {
    if (this.getUserInformationForm.invalid) {
      this.notificationService.showError('Proszę wypełnić wszystkie pola');
      return;
    }

    const userId = this.getUserInformationForm.value.userId;
    this.getUserInformationForAdmin(userId);
  }
}
