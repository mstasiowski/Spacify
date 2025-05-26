import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import {
  spaceAndSpecialCharValidator,
  noSpacesValidator,
  strongPasswordValidator,
  noNumbersValidator,
} from '../../helpers/validators';
import { NotificationService } from '../../services/notification.service';
import { RegisterUserResponse } from '../../models/response/register-user-response';

@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  registerForm: FormGroup;
  submitted = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.registerForm = this.fb.group({
      name: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          spaceAndSpecialCharValidator(),
          noNumbersValidator(),
        ],
      ],
      surname: [
        '',
        [
          Validators.required,
          Validators.maxLength(50),
          spaceAndSpecialCharValidator(),
          noNumbersValidator(),
        ],
      ],
      email: [
        '',
        [Validators.required, Validators.email, Validators.maxLength(100)],
      ],
      password: [
        '',
        [
          Validators.required,
          Validators.maxLength(100),
          ,
          noSpacesValidator(),
          strongPasswordValidator(),
        ],
      ],
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) return;

    this.authService.register(this.registerForm.value).subscribe({
      next: (res: RegisterUserResponse) => {
        this.successMessage = 'Rejestracja zakończona sukcesem!';
        this.errorMessage = '';

        this.notificationService.showInfo(`Twoj login to: ${res.username}`);
        this.notificationService.showSuccess(`Witaj ${res.name}!`);

        this.registerForm.reset();
        this.submitted = false;
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.errorMessage = 'Rejestracja nie powiodła się.';
        this.successMessage = '';
        this.notificationService.showError(
          'Formularz rejestracji jest niepoprawny'
        );
      },
    });
  }

  get f() {
    return this.registerForm.controls;
  }

  showPassword = false;

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
}
