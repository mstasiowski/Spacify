import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { LoginUserRequest } from '../../models/request/login-user-request';
import { takeUntil } from 'rxjs';
import { Unsubscribe } from '../../helpers/unsubscribe.class';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../services/notification.service';
import {
  noSpacesValidator,
  strongPasswordValidator,
  spaceAndSpecialCharValidator,
} from '../../helpers/validators';

@Component({
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent extends Unsubscribe {
  loginForm: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    super();
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, spaceAndSpecialCharValidator()]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid) return;

    this.isSubmitting = true;
    this.errorMessage = '';

    const loginRequest: LoginUserRequest = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password,
    };

    this.authService
      .loginUser(loginRequest)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (res) => {
          this.authService.saveAccessToken(res.accessToken);
          this.notificationService.showSuccess('Zalogowano');
          let user = this.authService.getUserInfo();
          this.authService.userSignal.set(user);
          this.router.navigateByUrl('/dashboard');
        },
        error: (err) => {
          if (
            err.error.title === 'Account is blocked. Please try again later.'
          ) {
            this.errorMessage =
              'Konto zostało zablokowane. Proszę spróbować później.';
          } else {
            this.errorMessage = 'Nieprawidłowa nazwa użytkownika lub hasło';
          }

          this.isSubmitting = false;
          this.notificationService.showError('Logowanie nieudane');
        },
        complete: () => {
          this.isSubmitting = false;
        },
      });
  }

  get f() {
    return this.loginForm.controls;
  }

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
