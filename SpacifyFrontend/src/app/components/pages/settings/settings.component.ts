import { Component, OnInit } from '@angular/core';
import { Unsubscribe } from '../../../helpers/unsubscribe.class';
import { CommonModule } from '@angular/common';

import { UserService } from '../../../services/user.service';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChangePasswordRequest } from '../../../models/request/change-password-request';
import {
  checkEmailValidator,
  noSpacesValidator,
  strongPasswordValidator,
} from '../../../helpers/validators';
import { takeUntil } from 'rxjs';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent extends Unsubscribe implements OnInit {
  constructor(
    private userService: UserService,
    private fb: FormBuilder,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {
    super();

    this.changeEmailForm = this.fb.group({
      currentEmail: ['', [Validators.required, Validators.email]],
      newEmail: [
        '',
        [Validators.required, Validators.email, checkEmailValidator()],
      ],
    });

    this.changePasswordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: [
        '',
        [Validators.required, strongPasswordValidator(), noSpacesValidator()],
      ],
    });
  }

  ngOnInit(): void {
    const user = this.authService.userSignal();
    if (user != undefined) {
      this.currentUser = user;
      this.changeEmailForm.patchValue({ currentEmail: user.email });
    }
  }

  currentUser: User | null = null;
  changeEmailForm: FormGroup;
  changePasswordForm: FormGroup;

  onChangeEmail(form: { newEmail: string }) {
    if (this.changeEmailForm.invalid) {
      this.notificationService.showError('Nieprawidłowy format e-mail');
      return;
    }

    const userId = this.currentUser?.id;

    if (!userId) {
      this.notificationService.showError('Nie znaleziono użytkownika');
      return;
    }

    this.userService
      .changeUserEmail(userId, form.newEmail)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('E-mail został zmieniony');
          this.changeEmailForm.reset();
          this.changeEmailForm.patchValue({ currentEmail: form.newEmail });
          this.authService.updateUserEmail(form.newEmail);
        },
        error: (error) => {
          this.notificationService.showError(error);
        },
      });
  }

  onChangePassword(form: ChangePasswordRequest) {
    if (this.changePasswordForm.invalid) {
      this.notificationService.showError('Nieprawidłowy format hasła');
      return;
    }

    const userId = this.currentUser?.id;

    if (!userId) {
      this.notificationService.showError('Nie znaleziono użytkownika');
      return;
    }

    this.userService
      .changeUserPassword(userId, form)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: () => {
          this.notificationService.showSuccess('Hasło zostało zmienione');
          this.changePasswordForm.reset();
        },
        error: (error) => {
          const apiMessage = {
            status: error.status,
            title: error.error?.title || 'Wystąpił błąd serwera.',
            type: error.type || 'error',
          };

          let userMessage = 'Wystąpił błąd.';

          // Dodaj sprawdzenie czy title to string
          const title = apiMessage.title || '';

          if (
            typeof title === 'string' &&
            title.includes(
              'Account is temporarily blocked due to too many failed attempts.'
            )
          ) {
            userMessage =
              'Twoje konto jest zablokowane z powodu zbyt wielu nieudanych prób logowania.';
          } else if (
            typeof title === 'string' &&
            title.includes('Current password is incorrect.')
          ) {
            userMessage = 'Podane aktualne hasło jest nieprawidłowe.';
          } else if (
            typeof title === 'string' &&
            title.includes(
              'New password cannot be the same as the current password.'
            )
          ) {
            userMessage = 'Nowe hasło nie może być takie samo jak obecne.';
          } else if (
            typeof title === 'string' &&
            title.includes('New password does not meet security requirements.')
          ) {
            userMessage = 'Nowe hasło nie spełnia wymagań bezpieczeństwa.';
          } else {
            userMessage = `Wystąpił błąd: ${error.status}. ${
              error.error?.title || ''
            }`;
          }

          this.notificationService.showError(
            userMessage,
            `Błąd ${apiMessage.status}`
          );
          console.log(error.error);
        },
      });
  }
}
